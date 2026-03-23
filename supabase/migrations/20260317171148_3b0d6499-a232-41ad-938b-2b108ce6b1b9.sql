
-- ═══════════════════════════════════════════════════════════
-- 1. FEATURE FLAGS TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read flags
CREATE POLICY "Anyone can read feature flags"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (true);

-- Only platform admins can manage flags
CREATE POLICY "Platform admins can manage feature flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (is_platform_admin(auth.uid()));

-- Seed data
INSERT INTO public.feature_flags (key, enabled) VALUES
  ('control_tower', true),
  ('ai_assistant', true),
  ('seat_enforcement', true);

-- ═══════════════════════════════════════════════════════════
-- 2. SUBSCRIPTIONS RLS: INSERT/UPDATE for platform admins
-- ═══════════════════════════════════════════════════════════
CREATE POLICY "Platform admins can insert subscriptions"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (is_platform_admin(auth.uid()));

-- ═══════════════════════════════════════════════════════════
-- 3. HELPER: log_system_event
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.log_system_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_enterprise_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usage_events (event_type, user_id, enterprise_id, metadata)
  VALUES (p_event_type, p_user_id, p_enterprise_id, p_metadata);
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 4. RPC: create_subscription
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.create_subscription(
  p_enterprise_id UUID,
  p_plan_type TEXT,
  p_seats INT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub_id UUID;
BEGIN
  -- Only platform admins
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: platform admin required';
  END IF;

  -- Insert subscription
  INSERT INTO public.subscriptions (enterprise_id, plan_type, status)
  VALUES (p_enterprise_id, p_plan_type, 'active')
  RETURNING id INTO v_sub_id;

  -- Update enterprise seats and tier
  UPDATE public.enterprises
  SET license_seats = p_seats, licensing_tier = p_plan_type
  WHERE id = p_enterprise_id;

  -- Log event
  PERFORM log_system_event('subscription.created', auth.uid(), p_enterprise_id,
    jsonb_build_object('plan_type', p_plan_type, 'seats', p_seats));

  RETURN v_sub_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 5. RPC: update_subscription (with seat recovery logic)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_subscription(
  p_enterprise_id UUID,
  p_new_seats INT,
  p_new_plan TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_seats INT;
  v_used_seats INT;
  v_available INT;
  v_to_activate INT;
  v_pending RECORD;
  v_activated INT := 0;
  v_to_deactivate INT;
  v_excess RECORD;
  v_deactivated INT := 0;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: platform admin required';
  END IF;

  SELECT license_seats, used_seats INTO v_old_seats, v_used_seats
  FROM public.enterprises WHERE id = p_enterprise_id;

  -- Update enterprise
  UPDATE public.enterprises
  SET license_seats = p_new_seats,
      licensing_tier = COALESCE(p_new_plan, licensing_tier)
  WHERE id = p_enterprise_id;

  -- Update subscription record
  UPDATE public.subscriptions
  SET plan_type = COALESCE(p_new_plan, plan_type)
  WHERE enterprise_id = p_enterprise_id AND status = 'active';

  -- SEAT RECOVERY: If seats increased, activate pending users
  IF p_new_seats > v_old_seats THEN
    v_available := p_new_seats - v_used_seats;
    IF v_available > 0 THEN
      FOR v_pending IN
        SELECT id FROM public.profiles
        WHERE enterprise_id = p_enterprise_id
          AND is_active = false
          AND pending_reason = 'seat_limit_exceeded'
        ORDER BY created_at ASC
        LIMIT v_available
      LOOP
        UPDATE public.profiles
        SET is_active = true, pending_reason = NULL
        WHERE id = v_pending.id;
        v_activated := v_activated + 1;
      END LOOP;

      IF v_activated > 0 THEN
        UPDATE public.enterprises
        SET used_seats = used_seats + v_activated
        WHERE id = p_enterprise_id;
      END IF;
    END IF;
  END IF;

  -- SEAT DECREASE: If new seats < used seats, mark newest as over_limit
  IF p_new_seats < v_used_seats THEN
    v_to_deactivate := v_used_seats - p_new_seats;
    FOR v_excess IN
      SELECT id FROM public.profiles
      WHERE enterprise_id = p_enterprise_id
        AND is_active = true
        AND role = 'staff'
      ORDER BY created_at DESC
      LIMIT v_to_deactivate
    LOOP
      UPDATE public.profiles
      SET is_active = false, pending_reason = 'over_limit'
      WHERE id = v_excess.id;
      v_deactivated := v_deactivated + 1;
    END LOOP;

    IF v_deactivated > 0 THEN
      UPDATE public.enterprises
      SET used_seats = used_seats - v_deactivated
      WHERE id = p_enterprise_id;
    END IF;
  END IF;

  PERFORM log_system_event('subscription.updated', auth.uid(), p_enterprise_id,
    jsonb_build_object('old_seats', v_old_seats, 'new_seats', p_new_seats, 'activated', v_activated, 'deactivated', v_deactivated));
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 6. RPC: approve_pending_users
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.approve_pending_users(
  p_enterprise_id UUID
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available INT;
  v_used INT;
  v_max INT;
  v_pending RECORD;
  v_activated INT := 0;
BEGIN
  -- Must be enterprise admin or platform admin
  IF NOT (is_platform_admin(auth.uid()) OR is_enterprise_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT used_seats, license_seats INTO v_used, v_max
  FROM public.enterprises WHERE id = p_enterprise_id;

  v_available := v_max - v_used;

  IF v_available <= 0 THEN
    RETURN 0;
  END IF;

  FOR v_pending IN
    SELECT id FROM public.profiles
    WHERE enterprise_id = p_enterprise_id
      AND is_active = false
      AND pending_reason = 'seat_limit_exceeded'
    ORDER BY created_at ASC
    LIMIT v_available
  LOOP
    UPDATE public.profiles
    SET is_active = true, pending_reason = NULL
    WHERE id = v_pending.id;
    v_activated := v_activated + 1;
  END LOOP;

  IF v_activated > 0 THEN
    UPDATE public.enterprises
    SET used_seats = used_seats + v_activated
    WHERE id = p_enterprise_id;

    PERFORM log_system_event('users.approved', auth.uid(), p_enterprise_id,
      jsonb_build_object('count', v_activated));
  END IF;

  RETURN v_activated;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 7. RPC: assign_role
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.assign_role(
  p_user_id UUID,
  p_new_role enterprise_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_role enterprise_role;
  v_target_enterprise_id UUID;
  v_caller_enterprise_id UUID;
BEGIN
  -- Get target user info
  SELECT role, enterprise_id INTO v_old_role, v_target_enterprise_id
  FROM public.profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Authorization: platform admin or enterprise admin of same enterprise
  IF is_platform_admin(auth.uid()) THEN
    -- OK
  ELSIF is_enterprise_admin(auth.uid()) THEN
    SELECT enterprise_id INTO v_caller_enterprise_id
    FROM public.profiles WHERE id = auth.uid();
    IF v_caller_enterprise_id IS DISTINCT FROM v_target_enterprise_id THEN
      RAISE EXCEPTION 'Cannot assign roles across enterprises';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unauthorized: admin required';
  END IF;

  -- Cannot change own role
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;

  UPDATE public.profiles SET role = p_new_role WHERE id = p_user_id;

  PERFORM log_system_event('role.changed', p_user_id, v_target_enterprise_id,
    jsonb_build_object('old_role', v_old_role::text, 'new_role', p_new_role::text, 'changed_by', auth.uid()));
END;
$$;

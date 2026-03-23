-- ============================================================
-- MedCompli / Compliance Collections AI Platform
-- Full Supabase Schema Export (Updated March 23, 2026)
-- Run this in your own Supabase project's SQL Editor
-- ============================================================

-- ========================
-- 1. ENUMS
-- ========================
CREATE TYPE public.enterprise_type AS ENUM ('hospital', 'medical_school', 'government', 'individual');
CREATE TYPE public.enterprise_role AS ENUM ('admin', 'compliance_officer', 'department_manager', 'staff');
CREATE TYPE public.platform_role AS ENUM ('platform_admin', 'user', 'rittenhouse_management');


-- ========================
-- 2. TABLES
-- ========================

-- Enterprises (Institutions)
CREATE TABLE public.enterprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type enterprise_type NOT NULL DEFAULT 'individual',
  domain text,
  contact_email text,
  license_seats integer NOT NULL DEFAULT 1,
  used_seats integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  licensing_tier text DEFAULT 'basic',
  logo_color text DEFAULT 'hsl(213 50% 35%)',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enterprise Locations (for multi-location Enterprise tier)
CREATE TABLE public.enterprise_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid NOT NULL REFERENCES public.enterprises(id),
  name text NOT NULL,
  address text,
  city text,
  state text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,  -- matches auth.users.id
  email text NOT NULL,
  full_name text,
  job_title text,
  enterprise_id uuid REFERENCES public.enterprises(id),
  location_id uuid REFERENCES public.enterprise_locations(id),
  role enterprise_role NOT NULL DEFAULT 'staff',
  is_active boolean NOT NULL DEFAULT true,
  pending_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Platform Roles (separate from enterprise roles — security best practice)
CREATE TABLE public.platform_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role platform_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Books
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  authors text[] NOT NULL DEFAULT '{}',
  publisher text,
  isbn text,
  edition text,
  published_year integer,
  description text DEFAULT '',
  specialty text DEFAULT 'Internal Medicine',
  tags text[] DEFAULT '{}',
  cover_color text DEFAULT 'hsl(213 50% 25%)',
  cover_url text,
  file_path text,
  file_type text DEFAULT 'epub',
  chapter_count integer DEFAULT 0,
  access_count integer DEFAULT 0,
  search_count integer DEFAULT 0,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Book Chapters
CREATE TABLE public.book_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id),
  chapter_key text NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  page_number integer DEFAULT 1,
  sort_order integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Book Access (enterprise-level entitlements)
CREATE TABLE public.book_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  enterprise_id uuid NOT NULL REFERENCES public.enterprises(id),
  access_level text NOT NULL DEFAULT 'full',
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Individual Purchases
CREATE TABLE public.individual_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  book_id text NOT NULL,
  price_paid numeric NOT NULL,
  purchased_at timestamptz NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  enterprise_id uuid REFERENCES public.enterprises(id),
  plan_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  monthly_price numeric,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Departments
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id uuid NOT NULL REFERENCES public.enterprises(id),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User Department Membership
CREATE TABLE public.user_department_membership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  department_id uuid NOT NULL REFERENCES public.departments(id),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Compliance Collections
CREATE TABLE public.compliance_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  icon text,
  is_system_bundle boolean NOT NULL DEFAULT false,
  enterprise_id uuid REFERENCES public.enterprises(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Collection Books (junction)
CREATE TABLE public.collection_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.compliance_collections(id),
  book_id text NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now()
);

-- Usage Events (login, search, views, clicks)
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  enterprise_id uuid REFERENCES public.enterprises(id),
  event_type text NOT NULL,
  book_id text,          -- TEXT (not UUID FK) to support both UUID and slug-style IDs
  book_title text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  enterprise_id uuid REFERENCES public.enterprises(id),
  action text NOT NULL,
  target_type text,
  target_id text,
  target_title text,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AI Query Logs
CREATE TABLE public.ai_query_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  book_title text NOT NULL,
  chapter_id text NOT NULL,
  chapter_title text NOT NULL,
  query_type text NOT NULL,
  user_prompt text,
  ai_response text NOT NULL,
  model_used text NOT NULL,
  response_time_ms integer NOT NULL,
  tokens_used integer,
  user_id uuid,
  enterprise_id uuid REFERENCES public.enterprises(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Bookmarks
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id text NOT NULL,
  book_title text NOT NULL,
  chapter_id text NOT NULL,
  chapter_title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Highlights
CREATE TABLE public.highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id text NOT NULL,
  chapter_id text NOT NULL,
  text text NOT NULL,
  color text NOT NULL DEFAULT 'hsl(48 96% 70%)',
  chunk_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Annotations
CREATE TABLE public.annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id text NOT NULL,
  chapter_id text NOT NULL,
  text text NOT NULL,
  note text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Feature Flags
CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Quote Requests (institutional inquiry workflow)
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  domain text,
  estimated_users integer NOT NULL DEFAULT 10,
  tier_requested text NOT NULL DEFAULT 'basic',
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- ========================
-- 3. DATABASE FUNCTIONS
-- ========================

-- Helper: get user's enterprise ID
CREATE OR REPLACE FUNCTION public.get_user_enterprise_id(user_uuid uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT enterprise_id FROM public.profiles WHERE id = user_uuid
$$;

-- Helper: check enterprise role
CREATE OR REPLACE FUNCTION public.has_enterprise_role(user_uuid uuid, required_role enterprise_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_uuid AND role = required_role)
$$;

-- Helper: is enterprise admin
CREATE OR REPLACE FUNCTION public.is_enterprise_admin(user_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_uuid AND role = 'admin')
$$;

-- Helper: is compliance officer
CREATE OR REPLACE FUNCTION public.is_compliance_officer(user_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_uuid AND role = 'compliance_officer')
$$;

-- Helper: is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(user_uuid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_roles WHERE user_id = user_uuid AND role = 'platform_admin')
$$;

-- Helper: check book access (enterprise + individual + subscription)
CREATE OR REPLACE FUNCTION public.has_book_access(user_uuid uuid, target_book_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.book_access ba
    JOIN public.profiles p ON p.enterprise_id = ba.enterprise_id
    WHERE p.id = user_uuid AND ba.book_id = target_book_id
      AND (ba.expires_at IS NULL OR ba.expires_at > now())
  ) OR EXISTS (
    SELECT 1 FROM public.individual_purchases ip
    WHERE ip.user_id = user_uuid AND ip.book_id = target_book_id
  ) OR EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE (s.user_id = user_uuid OR s.enterprise_id = (SELECT enterprise_id FROM public.profiles WHERE id = user_uuid))
      AND s.status = 'active'
      AND (s.expires_at IS NULL OR s.expires_at > now())
  )
$$;

-- Log system events
CREATE OR REPLACE FUNCTION public.log_system_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_enterprise_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.usage_events (event_type, user_id, enterprise_id, metadata)
  VALUES (p_event_type, p_user_id, p_enterprise_id, p_metadata);
END;
$$;

-- Assign enterprise role (with authorization checks)
CREATE OR REPLACE FUNCTION public.assign_role(p_user_id uuid, p_new_role enterprise_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_old_role enterprise_role;
  v_target_enterprise_id UUID;
  v_caller_enterprise_id UUID;
BEGIN
  SELECT role, enterprise_id INTO v_old_role, v_target_enterprise_id
  FROM public.profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

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

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;

  UPDATE public.profiles SET role = p_new_role WHERE id = p_user_id;

  PERFORM log_system_event('role.changed', p_user_id, v_target_enterprise_id,
    jsonb_build_object('old_role', v_old_role::text, 'new_role', p_new_role::text, 'changed_by', auth.uid()));
END;
$$;

-- Create subscription (platform admin only)
CREATE OR REPLACE FUNCTION public.create_subscription(p_enterprise_id uuid, p_plan_type text, p_seats integer)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_sub_id UUID;
BEGIN
  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: platform admin required';
  END IF;

  INSERT INTO public.subscriptions (enterprise_id, plan_type, status)
  VALUES (p_enterprise_id, p_plan_type, 'active')
  RETURNING id INTO v_sub_id;

  UPDATE public.enterprises
  SET license_seats = p_seats, licensing_tier = p_plan_type
  WHERE id = p_enterprise_id;

  PERFORM log_system_event('subscription.created', auth.uid(), p_enterprise_id,
    jsonb_build_object('plan_type', p_plan_type, 'seats', p_seats));

  RETURN v_sub_id;
END;
$$;

-- Update subscription (with seat recovery / decrease logic)
CREATE OR REPLACE FUNCTION public.update_subscription(p_enterprise_id uuid, p_new_seats integer, p_new_plan text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
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

  UPDATE public.enterprises
  SET license_seats = p_new_seats,
      licensing_tier = COALESCE(p_new_plan, licensing_tier)
  WHERE id = p_enterprise_id;

  UPDATE public.subscriptions
  SET plan_type = COALESCE(p_new_plan, plan_type)
  WHERE enterprise_id = p_enterprise_id AND status = 'active';

  -- Seat recovery: activate pending users if seats increased
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

  -- Seat decrease: deactivate newest staff if over limit
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

-- Approve pending users (batch)
CREATE OR REPLACE FUNCTION public.approve_pending_users(p_enterprise_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_available INT;
  v_used INT;
  v_max INT;
  v_pending RECORD;
  v_activated INT := 0;
BEGIN
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

-- Auto-create profile on signup (with enterprise domain matching + seat enforcement)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  matched_enterprise_id uuid;
  matched_contact_email text;
  user_domain text;
  current_seats integer;
  max_seats integer;
  assigned_role enterprise_role;
BEGIN
  user_domain := split_part(NEW.email, '@', 2);

  SELECT id, contact_email INTO matched_enterprise_id, matched_contact_email
  FROM public.enterprises
  WHERE domain = user_domain AND is_active = true
  LIMIT 1;

  IF matched_enterprise_id IS NOT NULL THEN
    -- Admin if email matches contact_email, otherwise staff
    IF lower(NEW.email) = lower(matched_contact_email) THEN
      assigned_role := 'admin';
    ELSE
      assigned_role := 'staff';
    END IF;

    -- Check seat capacity
    SELECT used_seats, license_seats INTO current_seats, max_seats
    FROM public.enterprises WHERE id = matched_enterprise_id;

    IF current_seats >= max_seats AND max_seats > 0 THEN
      -- Seat limit exceeded: inactive with pending reason
      INSERT INTO public.profiles (id, email, full_name, enterprise_id, role, is_active, pending_reason)
      VALUES (
        NEW.id, NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        matched_enterprise_id, assigned_role, false, 'seat_limit_exceeded'
      );
    ELSE
      -- Within limit: active user
      INSERT INTO public.profiles (id, email, full_name, enterprise_id, role)
      VALUES (
        NEW.id, NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        matched_enterprise_id, assigned_role
      );

      UPDATE public.enterprises
      SET used_seats = used_seats + 1
      WHERE id = matched_enterprise_id;
    END IF;

    PERFORM log_system_event('user.signup', NEW.id, matched_enterprise_id,
      jsonb_build_object('role', assigned_role::text, 'auto_admin', (assigned_role = 'admin')));
  ELSE
    -- No matching enterprise
    INSERT INTO public.profiles (id, email, full_name, enterprise_id)
    VALUES (
      NEW.id, NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Auto-assign default platform role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.platform_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ========================
-- 4. TRIGGERS
-- ========================

-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-assign platform role on signup
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Auto-update updated_at on enterprises
CREATE TRIGGER update_enterprises_updated_at
  BEFORE UPDATE ON public.enterprises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ========================
-- 5. ROW LEVEL SECURITY
-- ========================

-- Enable RLS on all tables
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_department_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- === enterprises ===
CREATE POLICY "Platform admins can manage enterprises" ON public.enterprises FOR ALL USING (is_platform_admin(auth.uid()));
CREATE POLICY "Users can view their own enterprise" ON public.enterprises FOR SELECT USING ((id = get_user_enterprise_id(auth.uid())) OR is_platform_admin(auth.uid()));

-- === enterprise_locations ===
CREATE POLICY "Enterprise admins can manage own locations" ON public.enterprise_locations FOR ALL USING (is_enterprise_admin(auth.uid()) AND enterprise_id = get_user_enterprise_id(auth.uid()));
CREATE POLICY "Platform admins can manage locations" ON public.enterprise_locations FOR ALL USING (is_platform_admin(auth.uid()));
CREATE POLICY "Users can view their enterprise locations" ON public.enterprise_locations FOR SELECT USING (enterprise_id = get_user_enterprise_id(auth.uid()));

-- === profiles ===
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can view enterprise members" ON public.profiles FOR SELECT USING (enterprise_id = get_user_enterprise_id(auth.uid()));
CREATE POLICY "Platform admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_platform_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    (id = auth.uid())
    AND (role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid()))
    AND (NOT (enterprise_id IS DISTINCT FROM (SELECT p.enterprise_id FROM profiles p WHERE p.id = auth.uid())))
  );
CREATE POLICY "Enterprise admins can manage members" ON public.profiles FOR ALL USING (is_enterprise_admin(auth.uid()) AND enterprise_id = get_user_enterprise_id(auth.uid()));

-- === platform_roles ===
CREATE POLICY "Only platform admins can view platform roles" ON public.platform_roles FOR SELECT USING ((user_id = auth.uid()) OR is_platform_admin(auth.uid()));

-- === books ===
CREATE POLICY "Anyone authenticated can view books" ON public.books FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enterprise admins can insert books" ON public.books FOR INSERT TO authenticated WITH CHECK (is_enterprise_admin(auth.uid()) OR is_platform_admin(auth.uid()));
CREATE POLICY "Enterprise admins can update books" ON public.books FOR UPDATE TO authenticated USING (is_enterprise_admin(auth.uid()) OR is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins can manage books" ON public.books FOR ALL TO authenticated USING (is_platform_admin(auth.uid()));

-- === book_chapters ===
CREATE POLICY "Anyone authenticated can view chapters" ON public.book_chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enterprise admins can insert chapters" ON public.book_chapters FOR INSERT TO authenticated WITH CHECK (is_enterprise_admin(auth.uid()) OR is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins can manage chapters" ON public.book_chapters FOR ALL TO authenticated USING (is_platform_admin(auth.uid()));

-- === book_access ===
CREATE POLICY "Enterprise admins can manage book access" ON public.book_access FOR ALL USING (is_enterprise_admin(auth.uid()) AND enterprise_id = get_user_enterprise_id(auth.uid()));
CREATE POLICY "Users can view their enterprise book access" ON public.book_access FOR SELECT USING (enterprise_id = get_user_enterprise_id(auth.uid()));

-- === individual_purchases ===
CREATE POLICY "Users can view their own purchases" ON public.individual_purchases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own purchases" ON public.individual_purchases FOR INSERT WITH CHECK (user_id = auth.uid());

-- === subscriptions ===
CREATE POLICY "Users can view their subscriptions" ON public.subscriptions FOR SELECT USING ((user_id = auth.uid()) OR (enterprise_id = get_user_enterprise_id(auth.uid())));
CREATE POLICY "Platform admins can insert subscriptions" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (is_platform_admin(auth.uid()));
CREATE POLICY "Platform admins can update subscriptions" ON public.subscriptions FOR UPDATE TO authenticated USING (is_platform_admin(auth.uid()));

-- === departments ===
CREATE POLICY "Users can view their enterprise departments" ON public.departments FOR SELECT USING (enterprise_id = get_user_enterprise_id(auth.uid()));
CREATE POLICY "Enterprise admins can manage departments" ON public.departments FOR ALL USING (is_enterprise_admin(auth.uid()) AND enterprise_id = get_user_enterprise_id(auth.uid()));

-- === user_department_membership ===
CREATE POLICY "Users can view their department memberships" ON public.user_department_membership FOR SELECT USING ((user_id = auth.uid()) OR (department_id IN (SELECT id FROM departments WHERE enterprise_id = get_user_enterprise_id(auth.uid()))));
CREATE POLICY "Enterprise admins can manage memberships" ON public.user_department_membership FOR ALL USING (is_enterprise_admin(auth.uid()) AND (department_id IN (SELECT id FROM departments WHERE enterprise_id = get_user_enterprise_id(auth.uid()))));

-- === compliance_collections ===
CREATE POLICY "Users can view system bundles and their enterprise collections" ON public.compliance_collections FOR SELECT USING ((is_system_bundle = true) OR (enterprise_id IS NULL) OR (enterprise_id = get_user_enterprise_id(auth.uid())));
CREATE POLICY "Admins and compliance officers can manage collections" ON public.compliance_collections FOR ALL USING ((is_enterprise_admin(auth.uid()) OR is_compliance_officer(auth.uid())) AND (enterprise_id = get_user_enterprise_id(auth.uid())));

-- === collection_books ===
CREATE POLICY "Users can view collection books" ON public.collection_books FOR SELECT USING (collection_id IN (SELECT id FROM compliance_collections WHERE is_system_bundle = true OR enterprise_id IS NULL OR enterprise_id = get_user_enterprise_id(auth.uid())));
CREATE POLICY "Admins can manage collection books" ON public.collection_books FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid()) OR ((is_enterprise_admin(auth.uid()) OR is_compliance_officer(auth.uid())) AND (collection_id IN (SELECT id FROM compliance_collections WHERE enterprise_id = get_user_enterprise_id(auth.uid()) OR enterprise_id IS NULL OR is_system_bundle = true))))
  WITH CHECK (is_platform_admin(auth.uid()) OR ((is_enterprise_admin(auth.uid()) OR is_compliance_officer(auth.uid())) AND (collection_id IN (SELECT id FROM compliance_collections WHERE enterprise_id = get_user_enterprise_id(auth.uid()) OR enterprise_id IS NULL OR is_system_bundle = true))));

-- === usage_events ===
CREATE POLICY "Users can insert usage events" ON public.usage_events FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));
CREATE POLICY "Enterprise users can view usage" ON public.usage_events FOR SELECT TO authenticated USING ((enterprise_id = get_user_enterprise_id(auth.uid())) OR (user_id = auth.uid()) OR is_platform_admin(auth.uid()) OR is_enterprise_admin(auth.uid()) OR is_compliance_officer(auth.uid()));

-- === audit_logs ===
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));
CREATE POLICY "Users can view their enterprise audit logs" ON public.audit_logs FOR SELECT USING ((enterprise_id = get_user_enterprise_id(auth.uid())) OR ((enterprise_id IS NULL) AND (user_id = auth.uid())));

-- === ai_query_logs ===
CREATE POLICY "Users can insert ai query logs" ON public.ai_query_logs FOR INSERT WITH CHECK ((user_id = auth.uid()) OR (user_id IS NULL));
CREATE POLICY "Users can view enterprise ai logs" ON public.ai_query_logs FOR SELECT TO authenticated USING ((enterprise_id = get_user_enterprise_id(auth.uid())) OR (user_id = auth.uid()));

-- === bookmarks ===
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (user_id = auth.uid());

-- === highlights ===
CREATE POLICY "Users can view own highlights" ON public.highlights FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own highlights" ON public.highlights FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own highlights" ON public.highlights FOR DELETE USING (user_id = auth.uid());

-- === annotations ===
CREATE POLICY "Users can view own annotations" ON public.annotations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own annotations" ON public.annotations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own annotations" ON public.annotations FOR DELETE USING (user_id = auth.uid());

-- === feature_flags ===
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform admins can manage feature flags" ON public.feature_flags FOR ALL TO authenticated USING (is_platform_admin(auth.uid()));

-- === quote_requests ===
CREATE POLICY "Anyone can insert quote requests" ON public.quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Platform admins can manage quote requests" ON public.quote_requests FOR ALL TO authenticated USING (is_platform_admin(auth.uid()));


-- ========================
-- 6. STORAGE
-- ========================
INSERT INTO storage.buckets (id, name, public) VALUES ('book-files', 'book-files', false);

CREATE POLICY "Authenticated users can upload book files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-files');

CREATE POLICY "Authenticated users can read book files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'book-files');


-- ========================
-- 7. AUTH SETTINGS (configure in Supabase Dashboard)
-- ========================
-- • Enable Email auth provider
-- • For demo: enable "Auto-confirm email" (disable for production)
-- • Set Site URL to your domain
-- • Add redirect URLs for your domain

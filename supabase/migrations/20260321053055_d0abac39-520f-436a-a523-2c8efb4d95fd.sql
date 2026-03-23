
-- Add domain column to quote_requests
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS domain TEXT;

-- Update handle_new_user to auto-assign admin role when email matches enterprise contact_email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    -- Determine role: admin if email matches contact_email, otherwise staff
    IF lower(NEW.email) = lower(matched_contact_email) THEN
      assigned_role := 'admin';
    ELSE
      assigned_role := 'staff';
    END IF;

    -- Check seat capacity
    SELECT used_seats, license_seats INTO current_seats, max_seats
    FROM public.enterprises
    WHERE id = matched_enterprise_id;

    IF current_seats >= max_seats AND max_seats > 0 THEN
      -- Seat limit exceeded: create user as inactive with pending reason
      INSERT INTO public.profiles (id, email, full_name, enterprise_id, role, is_active, pending_reason)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        matched_enterprise_id,
        assigned_role,
        false,
        'seat_limit_exceeded'
      );
    ELSE
      -- Within seat limit: create active user and increment seats
      INSERT INTO public.profiles (id, email, full_name, enterprise_id, role)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        matched_enterprise_id,
        assigned_role
      );
      
      UPDATE public.enterprises
      SET used_seats = used_seats + 1
      WHERE id = matched_enterprise_id;
    END IF;

    -- Log the signup event
    PERFORM log_system_event(
      'user.signup',
      NEW.id,
      matched_enterprise_id,
      jsonb_build_object('role', assigned_role::text, 'auto_admin', (assigned_role = 'admin'))
    );
  ELSE
    -- No matching enterprise
    INSERT INTO public.profiles (id, email, full_name, enterprise_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Reattach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

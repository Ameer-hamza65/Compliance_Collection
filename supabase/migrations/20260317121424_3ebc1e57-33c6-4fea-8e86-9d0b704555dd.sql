-- Fix 1: Replace handle_new_user_role to assign 'user' instead of 'platform_admin'
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.platform_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix 2: Update handle_new_user to auto-assign enterprise based on email domain
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  matched_enterprise_id uuid;
  user_domain text;
BEGIN
  user_domain := split_part(NEW.email, '@', 2);
  
  SELECT id INTO matched_enterprise_id
  FROM public.enterprises
  WHERE domain = user_domain
  LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, enterprise_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    matched_enterprise_id
  );

  IF matched_enterprise_id IS NOT NULL THEN
    UPDATE public.enterprises
    SET used_seats = used_seats + 1
    WHERE id = matched_enterprise_id;
  END IF;

  RETURN NEW;
END;
$$;
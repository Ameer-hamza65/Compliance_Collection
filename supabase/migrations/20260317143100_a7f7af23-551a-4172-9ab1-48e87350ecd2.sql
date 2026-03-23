-- Add pending_reason column to profiles for seat limit enforcement
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pending_reason text DEFAULT NULL;

-- Update handle_new_user() trigger to enforce seat limits
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  matched_enterprise_id uuid;
  user_domain text;
  current_seats integer;
  max_seats integer;
BEGIN
  user_domain := split_part(NEW.email, '@', 2);
  
  SELECT id INTO matched_enterprise_id
  FROM public.enterprises
  WHERE domain = user_domain
  LIMIT 1;

  IF matched_enterprise_id IS NOT NULL THEN
    -- Check seat capacity
    SELECT used_seats, license_seats INTO current_seats, max_seats
    FROM public.enterprises
    WHERE id = matched_enterprise_id;

    IF current_seats >= max_seats AND max_seats > 0 THEN
      -- Seat limit exceeded: create user as inactive with pending reason
      INSERT INTO public.profiles (id, email, full_name, enterprise_id, is_active, pending_reason)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        matched_enterprise_id,
        false,
        'seat_limit_exceeded'
      );
    ELSE
      -- Within seat limit: create active user and increment seats
      INSERT INTO public.profiles (id, email, full_name, enterprise_id)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        matched_enterprise_id
      );
      
      UPDATE public.enterprises
      SET used_seats = used_seats + 1
      WHERE id = matched_enterprise_id;
    END IF;
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
$function$;
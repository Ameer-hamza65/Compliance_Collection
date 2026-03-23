
-- 1. Attach handle_new_user trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Attach handle_new_user_role trigger
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 3. Backfill profile for existing user
INSERT INTO public.profiles (id, email, full_name, enterprise_id, role)
SELECT id, email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'e0000000-0000-4000-a000-000000000001',
  'admin'
FROM auth.users
WHERE email = 'ameerhmza547@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  enterprise_id = EXCLUDED.enterprise_id,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

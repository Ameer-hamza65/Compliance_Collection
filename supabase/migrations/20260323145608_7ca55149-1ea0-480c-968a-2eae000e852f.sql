-- Create trigger for handle_new_user (profile creation + enterprise assignment)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for handle_new_user_role (platform_roles default entry)
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill: create profiles for any auth.users missing a profile
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1))
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Backfill: create platform_roles for any auth.users missing a role
INSERT INTO public.platform_roles (user_id, role)
SELECT au.id, 'user'
FROM auth.users au
LEFT JOIN public.platform_roles pr ON pr.user_id = au.id
WHERE pr.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
CREATE POLICY "Platform admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));
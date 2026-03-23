-- Fix 1a: Prevent privilege escalation via profile self-update
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND enterprise_id IS NOT DISTINCT FROM (SELECT p.enterprise_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Fix 1b: AI query logs - remove unauthenticated access
DROP POLICY IF EXISTS "Users can view enterprise ai logs" ON public.ai_query_logs;
CREATE POLICY "Users can view enterprise ai logs" ON public.ai_query_logs
  FOR SELECT TO authenticated
  USING (
    enterprise_id = get_user_enterprise_id(auth.uid())
    OR user_id = auth.uid()
  );
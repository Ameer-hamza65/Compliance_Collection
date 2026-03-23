-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Admins can manage collection books" ON public.collection_books;

-- Recreate with support for system bundles and null-enterprise collections
CREATE POLICY "Admins can manage collection books"
ON public.collection_books
FOR ALL
TO authenticated
USING (
  (is_platform_admin(auth.uid()))
  OR
  (
    (is_enterprise_admin(auth.uid()) OR is_compliance_officer(auth.uid()))
    AND
    (collection_id IN (
      SELECT id FROM compliance_collections
      WHERE enterprise_id = get_user_enterprise_id(auth.uid())
         OR enterprise_id IS NULL
         OR is_system_bundle = true
    ))
  )
)
WITH CHECK (
  (is_platform_admin(auth.uid()))
  OR
  (
    (is_enterprise_admin(auth.uid()) OR is_compliance_officer(auth.uid()))
    AND
    (collection_id IN (
      SELECT id FROM compliance_collections
      WHERE enterprise_id = get_user_enterprise_id(auth.uid())
         OR enterprise_id IS NULL
         OR is_system_bundle = true
    ))
  )
);
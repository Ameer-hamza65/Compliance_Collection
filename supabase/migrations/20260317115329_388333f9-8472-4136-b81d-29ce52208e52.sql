-- 1. Attach the handle_new_user trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Attach the handle_new_user_role trigger to auth.users
CREATE TRIGGER on_auth_user_role_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 3. Backfill profiles for existing auth users
INSERT INTO public.profiles (id, email, full_name)
VALUES
  ('0fa56215-96d9-455f-8564-956b656c53c1', 'ameerhmza547@gmail.com', 'Hamza Ameer'),
  ('46efd091-791a-420d-8de5-72975525b7cc', 'hamza5993795@gmail.com', 'Ameer Staff')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed enterprise
INSERT INTO public.enterprises (id, name, type, domain, contact_email, license_seats, used_seats, licensing_tier, logo_color)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'Sarasota Memorial Hospital',
  'hospital',
  'smh.com',
  'admin@smh.com',
  25,
  2,
  'professional',
  'hsl(213 50% 35%)'
);

-- 5. Assign users to enterprise
UPDATE public.profiles
SET enterprise_id = 'e1000000-0000-0000-0000-000000000001',
    role = 'admin',
    job_title = 'Platform Administrator'
WHERE id = '0fa56215-96d9-455f-8564-956b656c53c1';

UPDATE public.profiles
SET enterprise_id = 'e1000000-0000-0000-0000-000000000001',
    role = 'staff',
    job_title = 'Medical Staff'
WHERE id = '46efd091-791a-420d-8de5-72975525b7cc';

-- 6. Seed departments
INSERT INTO public.departments (id, enterprise_id, name, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Surgery', 'Surgical department including OR and pre-op'),
  ('d1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Emergency Medicine', 'Emergency department and trauma services'),
  ('d1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'Compliance', 'Regulatory compliance and quality assurance');

-- 7. Department memberships
INSERT INTO public.user_department_membership (user_id, department_id, is_primary) VALUES
  ('0fa56215-96d9-455f-8564-956b656c53c1', 'd1000000-0000-0000-0000-000000000003', true),
  ('0fa56215-96d9-455f-8564-956b656c53c1', 'd1000000-0000-0000-0000-000000000001', false),
  ('46efd091-791a-420d-8de5-72975525b7cc', 'd1000000-0000-0000-0000-000000000002', true);

-- 8. Platform admin role for Hamza
INSERT INTO public.platform_roles (user_id, role)
VALUES ('0fa56215-96d9-455f-8564-956b656c53c1', 'platform_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 9. Seed compliance collections (system bundles)
INSERT INTO public.compliance_collections (id, name, description, category, icon, is_system_bundle) VALUES
  ('cc100000-0000-0000-0000-000000000001', 'JCAHO Standards', 'Joint Commission accreditation standards and guidelines for hospital compliance', 'accreditation', 'Shield', true),
  ('cc100000-0000-0000-0000-000000000002', 'CMS Regulations', 'Centers for Medicare & Medicaid Services regulatory requirements', 'regulatory', 'FileText', true),
  ('cc100000-0000-0000-0000-000000000003', 'OSHA Safety', 'Occupational Safety and Health Administration workplace safety standards', 'safety', 'AlertTriangle', true),
  ('cc100000-0000-0000-0000-000000000004', 'Infection Control', 'Hospital infection prevention and control protocols and evidence-based guidelines', 'clinical', 'Bug', true),
  ('cc100000-0000-0000-0000-000000000005', 'Surgical Safety', 'Perioperative safety checklists, protocols, and best practice guidelines', 'clinical', 'Heart', true);

-- 10. Enterprise-specific collection
INSERT INTO public.compliance_collections (id, name, description, category, icon, is_system_bundle, enterprise_id) VALUES
  ('cc100000-0000-0000-0000-000000000006', 'SMH Internal Policies', 'Sarasota Memorial Hospital internal policy documents and procedures', 'institutional', 'Building', false, 'e1000000-0000-0000-0000-000000000001');
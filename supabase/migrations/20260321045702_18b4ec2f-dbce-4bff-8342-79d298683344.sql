
-- 4. Seed demo enterprise
INSERT INTO public.enterprises (id, name, domain, type, licensing_tier, license_seats, used_seats, contact_email, is_active)
VALUES (
  'e0000000-0000-4000-a000-000000000001',
  'Sarasota Memorial Hospital',
  'gmail.com',
  'hospital',
  'pro',
  25,
  1,
  'admin@sarasotamemorial.com',
  true
) ON CONFLICT (id) DO NOTHING;

-- 5. Assign user to enterprise
UPDATE public.profiles
SET enterprise_id = 'e0000000-0000-4000-a000-000000000001', role = 'admin'
WHERE email = 'ameerhmza547@gmail.com' AND enterprise_id IS NULL;

-- 6. Grant platform_admin role
INSERT INTO public.platform_roles (user_id, role)
SELECT id, 'platform_admin' FROM auth.users WHERE email = 'ameerhmza547@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Seed departments
INSERT INTO public.departments (id, name, enterprise_id, description) VALUES
  ('d0000000-0000-4000-a000-000000000001', 'Surgery', 'e0000000-0000-4000-a000-000000000001', 'Surgical department'),
  ('d0000000-0000-4000-a000-000000000002', 'Emergency Medicine', 'e0000000-0000-4000-a000-000000000001', 'Emergency department'),
  ('d0000000-0000-4000-a000-000000000003', 'Compliance', 'e0000000-0000-4000-a000-000000000001', 'Compliance and risk management')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed compliance collections
INSERT INTO public.compliance_collections (id, name, category, description, is_system_bundle, icon) VALUES
  ('c0000000-0000-4000-a000-000000000001', 'JCAHO Standards', 'Accreditation', 'Joint Commission accreditation standards and guidelines', true, 'Shield'),
  ('c0000000-0000-4000-a000-000000000002', 'CMS Regulations', 'Federal', 'Centers for Medicare & Medicaid Services compliance requirements', true, 'FileText'),
  ('c0000000-0000-4000-a000-000000000003', 'OSHA Safety', 'Safety', 'Occupational Safety and Health Administration workplace safety', true, 'AlertTriangle'),
  ('c0000000-0000-4000-a000-000000000004', 'Infection Control', 'Clinical', 'Infection prevention and control protocols', true, 'Bug'),
  ('c0000000-0000-4000-a000-000000000005', 'Surgical Safety', 'Clinical', 'Perioperative safety checklists and procedures', true, 'Heart')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed feature flags
INSERT INTO public.feature_flags (key, enabled) VALUES
  ('control_tower', true),
  ('ai_search', true),
  ('rbac_enforcement', true)
ON CONFLICT (key) DO NOTHING;

-- 10. Seed subscription for the enterprise
INSERT INTO public.subscriptions (enterprise_id, plan_type, status)
VALUES ('e0000000-0000-4000-a000-000000000001', 'pro', 'active');

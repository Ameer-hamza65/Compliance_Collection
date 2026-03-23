-- Create profiles for existing users that are missing them
INSERT INTO public.profiles (id, email, full_name, enterprise_id, role)
VALUES 
  ('0fa56215-96d9-455f-8564-956b656c53c1', 'ameerhmza547@gmail.com', 'Hamza (Admin)', 'e1000000-0000-0000-0000-000000000001', 'admin'),
  ('46efd091-791a-420d-8de5-72975525b7cc', 'hamza5993795@gmail.com', 'Hamza', 'e1000000-0000-0000-0000-000000000001', 'staff')
ON CONFLICT (id) DO NOTHING;

-- Update enterprise seat count
UPDATE public.enterprises SET used_seats = 3 WHERE id = 'e1000000-0000-0000-0000-000000000001';
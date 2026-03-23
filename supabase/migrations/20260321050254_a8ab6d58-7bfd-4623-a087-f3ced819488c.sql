
-- 1. Create enterprise_locations table for multi-location support
CREATE TABLE public.enterprise_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES public.enterprises(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.enterprise_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage locations" ON public.enterprise_locations
  FOR ALL USING (is_platform_admin(auth.uid()));

CREATE POLICY "Enterprise admins can manage own locations" ON public.enterprise_locations
  FOR ALL USING (
    is_enterprise_admin(auth.uid()) AND
    enterprise_id = get_user_enterprise_id(auth.uid())
  );

CREATE POLICY "Users can view their enterprise locations" ON public.enterprise_locations
  FOR SELECT USING (enterprise_id = get_user_enterprise_id(auth.uid()));

-- 2. Add location_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.enterprise_locations(id);

-- 3. Add rittenhouse_management to platform_role enum
ALTER TYPE public.platform_role ADD VALUE IF NOT EXISTS 'rittenhouse_management';

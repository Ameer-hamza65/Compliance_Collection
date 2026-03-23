
-- Add is_active column to enterprises
ALTER TABLE public.enterprises ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create quote_requests table
CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  tier_requested text NOT NULL DEFAULT 'basic',
  estimated_users integer NOT NULL DEFAULT 10,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can submit a quote request
CREATE POLICY "Anyone can insert quote requests"
ON public.quote_requests FOR INSERT TO public
WITH CHECK (true);

-- Only platform admins can view/manage quote requests
CREATE POLICY "Platform admins can manage quote requests"
ON public.quote_requests FOR ALL TO authenticated
USING (is_platform_admin(auth.uid()));

-- Update trigger for updated_at
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

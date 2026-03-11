
-- Add new columns to service_providers for registration form
ALTER TABLE public.service_providers 
  ADD COLUMN IF NOT EXISTS shop_name text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS upi_id text,
  ADD COLUMN IF NOT EXISTS password_hash text;

-- Create storage bucket for provider photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('provider-photos', 'provider-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for provider photos bucket - allow anyone to read
CREATE POLICY "Public read provider photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'provider-photos');

-- Allow authenticated/anon to upload  
CREATE POLICY "Allow upload provider photos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'provider-photos');

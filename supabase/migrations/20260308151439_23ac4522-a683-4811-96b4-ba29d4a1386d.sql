
-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  provider_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table for role-based access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add verification fields to service_providers
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Add new booking statuses support - add provider_location columns to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS provider_lat DOUBLE PRECISION;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS provider_lng DOUBLE PRECISION;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS quote_id UUID;

-- Enable RLS on new tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS for quotes
CREATE POLICY "Allow insert quotes" ON public.quotes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select quotes" ON public.quotes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update quotes" ON public.quotes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- RLS for reviews
CREATE POLICY "Allow insert reviews" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

-- RLS for admin_users
CREATE POLICY "Allow select admin_users" ON public.admin_users FOR SELECT TO anon, authenticated USING (true);

-- Enable realtime for bookings and quotes
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- Add trigger for updated_at on quotes
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

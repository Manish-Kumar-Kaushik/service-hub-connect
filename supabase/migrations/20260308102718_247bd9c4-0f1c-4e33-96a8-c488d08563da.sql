
-- Service providers table
CREATE TABLE public.service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  services_offered text[] DEFAULT '{}',
  category text,
  experience_years integer DEFAULT 0,
  is_active boolean DEFAULT true,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view all providers" ON public.service_providers FOR SELECT USING (true);
CREATE POLICY "Providers can insert own profile" ON public.service_providers FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id);
CREATE POLICY "Providers can update own profile" ON public.service_providers FOR UPDATE USING ((auth.jwt() ->> 'sub'::text) = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL DEFAULT 'booking',
  title text NOT NULL,
  message text NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((auth.jwt() ->> 'sub'::text) = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((auth.jwt() ->> 'sub'::text) = user_id);
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Add new columns to bookings
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS customer_address text,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS provider_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS provider_id uuid;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger for updated_at on service_providers
CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

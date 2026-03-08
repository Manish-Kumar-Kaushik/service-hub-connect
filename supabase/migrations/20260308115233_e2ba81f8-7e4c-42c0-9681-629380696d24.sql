
-- Drop all existing RLS policies for profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Drop all existing RLS policies for bookings
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Drop all existing RLS policies for service_providers
DROP POLICY IF EXISTS "Providers can insert own profile" ON public.service_providers;
DROP POLICY IF EXISTS "Providers can update own profile" ON public.service_providers;
DROP POLICY IF EXISTS "Providers can view all providers" ON public.service_providers;

-- Drop all existing RLS policies for notifications
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

-- =============================================
-- NEW POLICIES: Allow anon role (Descope auth is validated client-side)
-- =============================================

-- PROFILES
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select own profile" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- BOOKINGS
CREATE POLICY "Allow insert bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select bookings" ON public.bookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update bookings" ON public.bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- SERVICE_PROVIDERS
CREATE POLICY "Allow insert service_providers" ON public.service_providers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select service_providers" ON public.service_providers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update service_providers" ON public.service_providers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- NOTIFICATIONS
CREATE POLICY "Allow insert notifications" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow select notifications" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow update notifications" ON public.notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

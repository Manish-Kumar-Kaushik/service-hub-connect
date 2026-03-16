
-- Provider Services table
CREATE TABLE public.provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  service_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select provider_services" ON public.provider_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert provider_services" ON public.provider_services FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update provider_services" ON public.provider_services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete provider_services" ON public.provider_services FOR DELETE TO anon, authenticated USING (true);

-- Provider Wallets table
CREATE TABLE public.provider_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  total_withdrawn numeric NOT NULL DEFAULT 0,
  bank_account text,
  bank_name text,
  ifsc_code text,
  upi_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.provider_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select provider_wallets" ON public.provider_wallets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert provider_wallets" ON public.provider_wallets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update provider_wallets" ON public.provider_wallets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Wallet Transactions table
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'credit',
  amount numeric NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select wallet_transactions" ON public.wallet_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert wallet_transactions" ON public.wallet_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Add realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;

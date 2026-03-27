-- =============================================================================
-- VESTED CRYPTO TRADING PLATFORM - SUPABASE SCHEMA (FIXED)
-- =============================================================================
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard → SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
--
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SUPER ADMIN TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.super_admin (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT DEFAULT 'Super Administrator',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.super_admin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can view own record" ON public.super_admin;
DROP POLICY IF EXISTS "Super admin can update own record" ON public.super_admin;

CREATE POLICY "Super admin can view own record" ON public.super_admin
    FOR SELECT USING (true);

CREATE POLICY "Super admin can update own record" ON public.super_admin
    FOR UPDATE USING (true);

-- =============================================================================
-- USERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    balance NUMERIC(20, 8) DEFAULT 0,
    profit_loss NUMERIC(20, 8) DEFAULT 0,
    withdrawal_address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- =============================================================================
-- AUTO-CREATE USER PROFILE TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, balance, profit_loss, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    0,
    0,
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================================
-- CRYPTOCURRENCIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cryptos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL UNIQUE,
    icon_url TEXT,
    price NUMERIC(20, 8) NOT NULL DEFAULT 0,
    staking_apy NUMERIC(5, 2) DEFAULT 0,
    change_24h NUMERIC(10, 2) DEFAULT 0,
    market_cap NUMERIC(30, 2) DEFAULT 0,
    volume_24h NUMERIC(30, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cryptos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active cryptos" ON public.cryptos;
DROP POLICY IF EXISTS "Super admin can manage cryptos" ON public.cryptos;

CREATE POLICY "Anyone can view active cryptos" ON public.cryptos
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admin can manage cryptos" ON public.cryptos
    FOR ALL USING (true);

-- =============================================================================
-- TRADERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.traders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    total_profit_loss NUMERIC(20, 8) DEFAULT 0,
    profit_loss_percentage NUMERIC(10, 2) DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    performance_data JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active traders" ON public.traders;
DROP POLICY IF EXISTS "Super admin can manage traders" ON public.traders;

CREATE POLICY "Anyone can view active traders" ON public.traders
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admin can manage traders" ON public.traders
    FOR ALL USING (true);

-- =============================================================================
-- TRANSACTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    amount NUMERIC(20, 8) NOT NULL,
    crypto_symbol TEXT,
    address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    proof_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Super admin can manage transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admin can manage transactions" ON public.transactions
    FOR ALL USING (true);

-- =============================================================================
-- USER CRYPTOS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_cryptos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    crypto_id UUID REFERENCES public.cryptos(id) ON DELETE CASCADE NOT NULL,
    balance NUMERIC(20, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, crypto_id)
);

ALTER TABLE public.user_cryptos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own crypto holdings" ON public.user_cryptos;
DROP POLICY IF EXISTS "Users can manage own crypto holdings" ON public.user_cryptos;
DROP POLICY IF EXISTS "Super admin can manage user cryptos" ON public.user_cryptos;

CREATE POLICY "Users can view own crypto holdings" ON public.user_cryptos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own crypto holdings" ON public.user_cryptos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage user cryptos" ON public.user_cryptos
    FOR ALL USING (true);

-- =============================================================================
-- USER TRADERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_traders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    trader_id UUID REFERENCES public.traders(id) ON DELETE CASCADE NOT NULL,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, trader_id)
);

ALTER TABLE public.user_traders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own trader subscriptions" ON public.user_traders;
DROP POLICY IF EXISTS "Users can manage own trader subscriptions" ON public.user_traders;
DROP POLICY IF EXISTS "Super admin can manage user traders" ON public.user_traders;

CREATE POLICY "Users can view own trader subscriptions" ON public.user_traders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own trader subscriptions" ON public.user_traders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage user traders" ON public.user_traders
    FOR ALL USING (true);

-- =============================================================================
-- USER CHART DATA TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_chart_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    value NUMERIC(20, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

ALTER TABLE public.user_chart_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chart data" ON public.user_chart_data;
DROP POLICY IF EXISTS "Super admin can manage chart data" ON public.user_chart_data;

CREATE POLICY "Users can view own chart data" ON public.user_chart_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage chart data" ON public.user_chart_data
    FOR ALL USING (true);

-- =============================================================================
-- ACTIVITY TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(20, 8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity" ON public.activity;
DROP POLICY IF EXISTS "Super admin can manage activity" ON public.activity;

CREATE POLICY "Users can view own activity" ON public.activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage activity" ON public.activity
    FOR ALL USING (true);

-- =============================================================================
-- ADMIN SETTINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Super admin can manage settings" ON public.admin_settings;

CREATE POLICY "Anyone can view settings" ON public.admin_settings
    FOR SELECT USING (true);

CREATE POLICY "Super admin can manage settings" ON public.admin_settings
    FOR ALL USING (true);

-- =============================================================================
-- EMAIL TEMPLATES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    type TEXT DEFAULT 'transactional' CHECK (type IN ('transactional', 'marketing')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can manage email templates" ON public.email_templates;

CREATE POLICY "Super admin can manage email templates" ON public.email_templates
    FOR ALL USING (true);

-- =============================================================================
-- EMAIL LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_name TEXT,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can manage email logs" ON public.email_logs;

CREATE POLICY "Super admin can manage email logs" ON public.email_logs
    FOR ALL USING (true);

-- =============================================================================
-- AUDIT LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    action TEXT NOT NULL,
    admin_id UUID,
    user_id UUID,
    entity_type TEXT,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can manage audit logs" ON public.audit_logs;

CREATE POLICY "Super admin can manage audit logs" ON public.audit_logs
    FOR ALL USING (true);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_cryptos_user_id ON public.user_cryptos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_traders_user_id ON public.user_traders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chart_data_user_id ON public.user_chart_data(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS handle_updated_at ON public.users;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.cryptos;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.cryptos
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.traders;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.traders
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.transactions;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.admin_settings;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.super_admin;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.super_admin
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert super admin (default credentials: admin / VestedAdmin2024!)
-- Password hashed with SHA-256 + "$sha256$" prefix (matches frontend hashPassword function)
INSERT INTO public.super_admin (username, password_hash, full_name)
VALUES (
    'admin',
    '$sha256$7728b96e020316fa5d235e3ed3d5b670ef7de1adec43da64b0175bbda92ed229',
    'Super Administrator'
)
ON CONFLICT (username) DO NOTHING;

-- Insert sample cryptocurrencies
INSERT INTO public.cryptos (name, symbol, price, staking_apy, change_24h, market_cap, volume_24h) VALUES
    ('Bitcoin', 'BTC', 64230, 4.5, 2.4, 1260000000000, 35000000000),
    ('Ethereum', 'ETH', 3450, 5.2, 1.8, 415000000000, 18000000000),
    ('Litecoin', 'LTC', 78.50, 3.8, -0.5, 5800000000, 450000000),
    ('Bitcoin Cash', 'BCH', 345, 2.5, 0.8, 6800000000, 280000000),
    ('Cardano', 'ADA', 0.45, 4.8, 5.2, 16000000000, 520000000),
    ('Stellar', 'XLM', 0.12, 3.2, -1.2, 3500000000, 120000000),
    ('Solana', 'SOL', 145, 6.5, 5.2, 65000000000, 2800000000),
    ('BNB', 'BNB', 590, 4.0, -0.5, 88000000000, 1200000000),
    ('XRP', 'XRP', 0.62, 2.8, -1.2, 34000000000, 1800000000)
ON CONFLICT (symbol) DO NOTHING;

-- Insert sample traders
INSERT INTO public.traders (name, bio, total_profit_loss, profit_loss_percentage, followers_count, performance_data) VALUES
    ('Alex Thompson', 'Professional crypto trader with 8+ years experience. Specializing in BTC and ETH strategies.', 245000, 145, 1247, '[{"date": "2024-02-20", "value": 100}, {"date": "2024-02-21", "value": 102}, {"date": "2024-02-22", "value": 105}, {"date": "2024-02-23", "value": 108}, {"date": "2024-02-24", "value": 112}]'),
    ('Maria Garcia', 'DeFi specialist focusing on yield farming and staking strategies.', 189000, 98, 892, '[{"date": "2024-02-20", "value": 100}, {"date": "2024-02-21", "value": 101}, {"date": "2024-02-22", "value": 103}, {"date": "2024-02-23", "value": 105}, {"date": "2024-02-24", "value": 107}]'),
    ('David Kim', 'Altcoin trader with expertise in emerging blockchain projects.', 156000, 87, 654, '[{"date": "2024-02-20", "value": 100}, {"date": "2024-02-21", "value": 100.5}, {"date": "2024-02-22", "value": 102}, {"date": "2024-02-23", "value": 104}, {"date": "2024-02-24", "value": 106}]'),
    ('Sarah Johnson', 'Long-term holder and portfolio strategist. Risk-adjusted returns focus.', 278000, 156, 1589, '[{"date": "2024-02-20", "value": 100}, {"date": "2024-02-21", "value": 103}, {"date": "2024-02-22", "value": 108}, {"date": "2024-02-23", "value": 114}, {"date": "2024-02-24", "value": 120}]')
ON CONFLICT DO NOTHING;

-- Insert default platform settings
INSERT INTO public.admin_settings (key, value, description) VALUES
    ('platform_name', 'Vested', 'Platform display name'),
    ('min_deposit', '10', 'Minimum deposit amount in USD'),
    ('max_withdrawal', '50000', 'Maximum withdrawal amount in USD'),
    ('withdrawal_fee', '0.5', 'Withdrawal fee percentage'),
    ('support_email', 'support@vested.com', 'Support email address'),
    ('maintenance_mode', 'false', 'Enable/disable maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Insert sample email templates
INSERT INTO public.email_templates (name, subject, html_content, text_content, type) VALUES
    ('deposit_approved', 'Your Deposit Has Been Approved',
     '<h2>Deposit Approved</h2><p>Your deposit of {{amount}} {{crypto}} has been approved and added to your account.</p>',
     'Your deposit of {{amount}} {{crypto}} has been approved and added to your account.',
     'transactional'),
    ('deposit_rejected', 'Your Deposit Request Was Rejected',
     '<h2>Deposit Rejected</h2><p>Unfortunately, your deposit request could not be processed. Reason: {{reason}}</p>',
     'Unfortunately, your deposit request could not be processed. Reason: {{reason}}',
     'transactional'),
    ('withdrawal_approved', 'Your Withdrawal Has Been Approved',
     '<h2>Withdrawal Approved</h2><p>Your withdrawal of {{amount}} {{crypto}} has been approved. It will be sent to your registered address shortly.</p>',
     'Your withdrawal of {{amount}} {{crypto}} has been approved. It will be sent to your registered address shortly.',
     'transactional'),
    ('withdrawal_rejected', 'Your Withdrawal Request Was Rejected',
     '<h2>Withdrawal Rejected</h2><p>Unfortunately, your withdrawal request could not be processed. Reason: {{reason}}</p>',
     'Unfortunately, your withdrawal request could not be processed. Reason: {{reason}}',
     'transactional')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

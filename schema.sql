-- =============================================================================
-- VESTED CRYPTO TRADING PLATFORM - SUPABASE SCHEMA
-- =============================================================================
-- 
-- This schema creates all necessary tables, indexes, functions, and security
-- policies for the Vested crypto trading platform.
--
-- INSTRUCTIONS:
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to the SQL Editor in your Supabase dashboard
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SUPER ADMIN TABLE (Separate from regular users)
-- =============================================================================
-- This table stores the super administrator credentials
-- Only ONE super admin account should exist

CREATE TABLE IF NOT EXISTS public.super_admin (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT DEFAULT 'Super Administrator',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on super_admin
ALTER TABLE public.super_admin ENABLE ROW LEVEL SECURITY;

-- Only the super admin can view/update their own record
CREATE POLICY "Super admin can view own record" ON public.super_admin
    FOR SELECT USING (true);

CREATE POLICY "Super admin can update own record" ON public.super_admin
    FOR UPDATE USING (true);

-- =============================================================================
-- USERS TABLE (Regular users - extends Supabase Auth)
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admin can view all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Super admin can update all users" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

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

-- Enable RLS
ALTER TABLE public.cryptos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cryptos
CREATE POLICY "Anyone can view active cryptos" ON public.cryptos
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admin can manage cryptos" ON public.cryptos
    FOR ALL USING (true);

-- =============================================================================
-- TRADERS TABLE (Copy Traders)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.traders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    total_profit_loss NUMERIC(20, 2) DEFAULT 0,
    profit_loss_percentage NUMERIC(10, 2) DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    performance_data JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for traders
CREATE POLICY "Anyone can view active traders" ON public.traders
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admin can manage traders" ON public.traders
    FOR ALL USING (true);

-- =============================================================================
-- USER_TRADERS TABLE (Junction - which traders users follow)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_traders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trader_id UUID REFERENCES public.traders(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, trader_id)
);

-- Enable RLS
ALTER TABLE public.user_traders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_traders
CREATE POLICY "Users can view own follows" ON public.user_traders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own follows" ON public.user_traders
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- TRANSACTIONS TABLE (Deposits & Withdrawals)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    amount NUMERIC(20, 8) NOT NULL,
    crypto_symbol TEXT,
    address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.super_admin(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admin can view all transactions" ON public.transactions
    FOR SELECT USING (true);

CREATE POLICY "Super admin can update transactions" ON public.transactions
    FOR UPDATE USING (true);

-- =============================================================================
-- ADMIN_SETTINGS TABLE (Platform configuration)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings
CREATE POLICY "Super admin can manage settings" ON public.admin_settings
    FOR ALL USING (true);

CREATE POLICY "Anyone can view settings" ON public.admin_settings
    FOR SELECT USING (true);

-- =============================================================================
-- USER_CHART_DATA TABLE (Portfolio history for charts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_chart_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value NUMERIC(20, 8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_chart_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_chart_data
CREATE POLICY "Users can view own chart data" ON public.user_chart_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage chart data" ON public.user_chart_data
    FOR ALL USING (true);

-- =============================================================================
-- USER_CRYPTOS TABLE (User holdings)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_cryptos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    crypto_id UUID REFERENCES public.cryptos(id) ON DELETE CASCADE,
    balance NUMERIC(20, 8) DEFAULT 0,
    staked_amount NUMERIC(20, 8) DEFAULT 0,
    UNIQUE(user_id, crypto_id)
);

-- Enable RLS
ALTER TABLE public.user_cryptos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_cryptos
CREATE POLICY "Users can view own holdings" ON public.user_cryptos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage holdings" ON public.user_cryptos
    FOR ALL USING (true);

-- =============================================================================
-- ACTIVITY_LOGS TABLE (User activity tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('receive', 'send', 'stake', 'unstake', 'trade')),
    amount NUMERIC(20, 8) NOT NULL,
    crypto_symbol TEXT NOT NULL,
    usd_value NUMERIC(20, 2),
    description TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_logs
CREATE POLICY "Users can view own activity" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage activity" ON public.activity_logs
    FOR ALL USING (true);

-- =============================================================================
-- EMAIL_TEMPLATES TABLE (For custom transactional emails)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    html_content TEXT,
    text_content TEXT,
    type TEXT DEFAULT 'transactional' CHECK (type IN ('transactional', 'marketing', 'notification')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage email templates" ON public.email_templates
    FOR ALL USING (true);

CREATE POLICY "Anyone can view active templates" ON public.email_templates
    FOR SELECT USING (is_active = TRUE);

-- =============================================================================
-- EMAIL_LOGS TABLE (Track sent emails)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view email logs" ON public.email_logs
    FOR SELECT USING (true);

-- =============================================================================
-- AUDIT_LOGS TABLE (Security audit trail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES public.super_admin(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view audit logs" ON public.audit_logs
    FOR SELECT USING (true);

CREATE POLICY "Super admin can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_super_admin_updated_at 
    BEFORE UPDATE ON public.super_admin 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cryptos_updated_at 
    BEFORE UPDATE ON public.cryptos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_traders_updated_at 
    BEFORE UPDATE ON public.traders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON public.transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at 
    BEFORE UPDATE ON public.admin_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON public.email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user balance on transaction approval
CREATE OR REPLACE FUNCTION update_user_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
        IF NEW.type = 'deposit' THEN
            UPDATE public.users SET balance = balance + NEW.amount WHERE id = NEW.user_id;
        ELSIF NEW.type = 'withdrawal' THEN
            UPDATE public.users SET balance = balance - NEW.amount WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_on_transaction
    AFTER UPDATE ON public.transactions
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved')
    EXECUTE FUNCTION update_user_balance_on_transaction();

-- =============================================================================
-- INDEXES (For performance)
-- =============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Cryptos indexes
CREATE INDEX IF NOT EXISTS idx_cryptos_symbol ON public.cryptos(symbol);
CREATE INDEX IF NOT EXISTS idx_cryptos_is_active ON public.cryptos(is_active);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- User traders indexes
CREATE INDEX IF NOT EXISTS idx_user_traders_user_id ON public.user_traders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_traders_trader_id ON public.user_traders(trader_id);

-- Chart data indexes
CREATE INDEX IF NOT EXISTS idx_user_chart_data_user_id ON public.user_chart_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chart_data_date ON public.user_chart_data(date);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert default super admin with SHA-256 hash for 'VestedAdmin2024!'
-- Hash computed as: '$sha256$' + SHA256('VestedAdmin2024!')
INSERT INTO public.super_admin (username, password_hash, full_name)
VALUES (
    'admin', 
    '$sha256$7728b96e020316fa5d235e3ed3d5b670ef7de1adec43da64b0175bbda92ed229',
    'Super Administrator'
)
ON CONFLICT (username) DO NOTHING;

-- Insert default admin settings
INSERT INTO public.admin_settings (key, value) VALUES
    ('platform_name', 'Vested'),
    ('platform_description', 'The future of crypto investing'),
    ('deposit_address_btc', 'bc1q2wrnatsqn06mtyycfkaqju6esagj9qf9ahnteh'),
    ('deposit_address_eth', '0x573A5372003e44Eb2E0F02DC5E31442a551b4904'),
    ('deposit_address_ltc', 'ltc1quyc8m29nwe0rrxr94d0t9968fdaevn0fzw94wd'),
    ('withdrawal_fee_btc', '0.0005'),
    ('withdrawal_fee_eth', '0.005'),
    ('withdrawal_fee_ltc', '0.001'),
    ('min_withdrawal_btc', '0.001'),
    ('min_withdrawal_eth', '0.01'),
    ('min_withdrawal_ltc', '0.1'),
    ('support_email', 'support@vested.com'),
    ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

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
    ('Alex Thompson', 'Professional crypto trader with 8+ years experience. Specializing in BTC and ETH strategies.', 245000, 145, 1247, '[{"date": "2024-02-20", "value": 100}, {"date": "2024-02-21", "value": 102}, {"date": "2024-02-22", "value": 105}]'),
    ('Maria Garcia', 'DeFi specialist focusing on yield farming and staking strategies.', 189000, 98, 892, '[{"date": "2024-02-20", "value": 100}, {"date": "2024-02-21", "value": 101}, {"date": "2024-02-22", "value": 103}]'),
    ('David Kim', 'Altcoin trader with expertise in emerging blockchain projects.', 156000, 87, 654, '[{"date": "2024-02-20", "value": 100}, {"date": "2024-02-21", "value": 100.5}, {"date": "2024-02-22", "value": 102}]'),
    ('Sarah Johnson', 'Long-term holder and portfolio strategist. Risk-adjusted returns focus.', 278000, 156, 1589, '[{"date": "2024-02-20", "value": 100}, {"date": "2024-02-21", "value": 103}, {"date": "2024-02-22", "value": 108}]')
ON CONFLICT DO NOTHING;

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

-- Grant usage to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions (RLS will handle row-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

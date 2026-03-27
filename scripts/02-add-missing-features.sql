-- ============================================
-- VESTED - MISSING FEATURES IMPLEMENTATION
-- ============================================
-- This script adds critical missing features to the Vested platform
-- Run this AFTER the initial schema is created

-- ============================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add missing columns to transactions table
ALTER TABLE IF EXISTS transactions
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS approved_by UUID NULL;

-- Add missing columns to email_templates table
ALTER TABLE IF EXISTS email_templates
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================
-- 2. CREATE MISSING INDEXES (Performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_traders_trader_id ON user_traders(trader_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- 3. CREATE AUTOMATION TRIGGERS
-- ============================================

-- Trigger: Auto-update user_chart_data when transactions occur
CREATE OR REPLACE FUNCTION update_user_chart_data_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_chart_data (user_id, date, value)
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    (SELECT balance FROM users WHERE id = NEW.user_id)
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET value = (SELECT balance FROM users WHERE id = NEW.user_id),
                updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_chart_data_on_transaction ON transactions;
CREATE TRIGGER trg_update_chart_data_on_transaction
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_chart_data_trigger();

-- Trigger: Auto-update user balance when approved deposits are created
CREATE OR REPLACE FUNCTION update_balance_on_approved_deposit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.type = 'deposit' THEN
    UPDATE users
    SET balance = balance + NEW.amount
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deposit_approved ON transactions;
CREATE TRIGGER trg_deposit_approved
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_balance_on_approved_deposit();

-- Trigger: Auto-deduct user balance when approved withdrawals are created
CREATE OR REPLACE FUNCTION update_balance_on_approved_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.type = 'withdrawal' THEN
    UPDATE users
    SET balance = balance - NEW.amount
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_withdrawal_approved ON transactions;
CREATE TRIGGER trg_withdrawal_approved
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_balance_on_approved_withdrawal();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cryptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cryptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chart_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_admin ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
DROP POLICY IF EXISTS "users_select_self" ON users;
CREATE POLICY "users_select_self" ON users
FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "users_update_self" ON users;
CREATE POLICY "users_update_self" ON users
FOR UPDATE USING (auth.uid() = id);

-- Users can see all cryptos
DROP POLICY IF EXISTS "cryptos_select_all" ON cryptos;
CREATE POLICY "cryptos_select_all" ON cryptos
FOR SELECT USING (true);

-- Users can only see their own holdings
DROP POLICY IF EXISTS "user_cryptos_select_self" ON user_cryptos;
CREATE POLICY "user_cryptos_select_self" ON user_cryptos
FOR SELECT USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Traders visible to all
DROP POLICY IF EXISTS "traders_select_all" ON traders;
CREATE POLICY "traders_select_all" ON traders
FOR SELECT USING (true);

-- Users can only see their followed traders
DROP POLICY IF EXISTS "user_traders_select_self" ON user_traders;
CREATE POLICY "user_traders_select_self" ON user_traders
FOR SELECT USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Users can only see their transactions
DROP POLICY IF EXISTS "transactions_select_self" ON transactions;
CREATE POLICY "transactions_select_self" ON transactions
FOR SELECT USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Users can only see their activity logs
DROP POLICY IF EXISTS "activity_logs_select_self" ON activity_logs;
CREATE POLICY "activity_logs_select_self" ON activity_logs
FOR SELECT USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Users can only see their chart data
DROP POLICY IF EXISTS "user_chart_data_select_self" ON user_chart_data;
CREATE POLICY "user_chart_data_select_self" ON user_chart_data
FOR SELECT USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Email templates visible to all (for frontend templates)
DROP POLICY IF EXISTS "email_templates_select_all" ON email_templates;
CREATE POLICY "email_templates_select_all" ON email_templates
FOR SELECT USING (true);

-- Settings visible to all
DROP POLICY IF EXISTS "admin_settings_select_all" ON admin_settings;
CREATE POLICY "admin_settings_select_all" ON admin_settings
FOR SELECT USING (true);

-- ============================================
-- 5. ADD SAMPLE ADMIN ACCOUNT
-- ============================================

-- Insert default admin if not exists
-- Password hash below is for "admin123" - CHANGE IN PRODUCTION!
INSERT INTO super_admin (username, full_name, password_hash)
VALUES (
  'admin',
  'Super Administrator',
  -- Using bcrypt hash: bcrypt('admin123')
  '$2a$10$YQv8kVHw8aM4G6X8zGkFae9XqI9gYh1YqhqPeJMlhVnqEJK0FKjwa'
)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 6. SEED DEFAULT DATA
-- ============================================

-- Add cryptocurrencies if not exists
INSERT INTO cryptos (symbol, name, price, market_cap, volume_24h)
VALUES
  ('BTC', 'Bitcoin', 45000.00, 900000000000, 30000000000),
  ('ETH', 'Ethereum', 2500.00, 300000000000, 15000000000),
  ('LTC', 'Litecoin', 500.00, 10000000000, 500000000),
  ('BCH', 'Bitcoin Cash', 300.00, 6000000000, 300000000),
  ('ADA', 'Cardano', 0.50, 20000000000, 800000000),
  ('XLM', 'Stellar Lumens', 0.15, 5000000000, 200000000)
ON CONFLICT (symbol) DO NOTHING;

-- ============================================
-- 7. SAMPLE EMAIL TEMPLATES
-- ============================================

-- Confirmation email template
INSERT INTO email_templates (name, subject, body, variables)
VALUES (
  'email_confirmation',
  'Verify Your Vested Account',
  '<html><body style="font-family: Arial, sans-serif; background-color: #f5f5f5;"><div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;"><h1 style="color: #6941C6;">Welcome to Vested</h1><p>Thank you for signing up for Vested. Please verify your email address by clicking the button below:</p><p><a href="{confirmation_link}" style="display: inline-block; background-color: #6941C6; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none;">Verify Email</a></p><p>If you did not create this account, please ignore this email.</p></div></body></html>',
  ARRAY['confirmation_link']
)
ON CONFLICT (name) DO NOTHING;

-- Deposit approved email template
INSERT INTO email_templates (name, subject, body, variables)
VALUES (
  'deposit_approved',
  'Your Deposit Has Been Approved',
  '<html><body style="font-family: Arial, sans-serif; background-color: #f5f5f5;"><div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;"><h1 style="color: #6941C6;">Deposit Approved</h1><p>Your deposit has been approved and credited to your account.</p><p><strong>Amount:</strong> {amount} {crypto}</p><p><strong>Status:</strong> <span style="color: #00AA00;">Completed</span></p><p>Thank you for trading with Vested.</p></div></body></html>',
  ARRAY['amount', 'crypto']
)
ON CONFLICT (name) DO NOTHING;

-- Withdrawal approved email template
INSERT INTO email_templates (name, subject, body, variables)
VALUES (
  'withdrawal_approved',
  'Your Withdrawal Has Been Approved',
  '<html><body style="font-family: Arial, sans-serif; background-color: #f5f5f5;"><div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;"><h1 style="color: #6941C6;">Withdrawal Approved</h1><p>Your withdrawal request has been approved and will be processed shortly.</p><p><strong>Amount:</strong> {amount} {crypto}</p><p><strong>Destination:</strong> {address}</p><p><strong>Status:</strong> <span style="color: #00AA00;">Processing</span></p></div></body></html>',
  ARRAY['amount', 'crypto', 'address']
)
ON CONFLICT (name) DO NOTHING;

-- Deposit approved email template
INSERT INTO email_templates (name, subject, html_content, text_content, type)
VALUES (
  'deposit_approved',
  'Your Deposit Has Been Approved',
  '<html><body><h1>Deposit Approved</h1><p>Your deposit of {amount} {crypto} has been approved and credited to your account.</p></body></html>',
  'Your deposit of {amount} {crypto} has been approved.',
  'transactional'
)
ON CONFLICT (name) DO NOTHING;

-- Withdrawal approved email template
INSERT INTO email_templates (name, subject, html_content, text_content, type)
VALUES (
  'withdrawal_approved',
  'Your Withdrawal Has Been Processed',
  '<html><body><h1>Withdrawal Processed</h1><p>Your withdrawal of {amount} {crypto} to {address} has been processed.</p></body></html>',
  'Your withdrawal of {amount} {crypto} has been processed.',
  'transactional'
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

-- Grant all permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Anonymous users get read-only access to public data
GRANT SELECT ON cryptos, traders, email_templates TO anon;

COMMIT;

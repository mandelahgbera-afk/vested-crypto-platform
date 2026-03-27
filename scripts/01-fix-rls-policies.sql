-- =============================================================================
-- FIX DUPLICATE RLS POLICIES (PHASE 1)
-- =============================================================================
-- This script removes duplicate RLS policies that may exist from multiple 
-- schema.sql runs and ensures clean, non-conflicting policies.
-- Run this ONCE to clean up the database.

-- Drop existing RLS policies (if they exist) to avoid conflicts
DROP POLICY IF EXISTS "Super admin can view own record" ON public.super_admin;
DROP POLICY IF EXISTS "Super admin can update own record" ON public.super_admin;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admin can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admin can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

DROP POLICY IF EXISTS "Anyone can view active cryptos" ON public.cryptos;
DROP POLICY IF EXISTS "Super admin can manage cryptos" ON public.cryptos;

DROP POLICY IF EXISTS "Anyone can view active traders" ON public.traders;
DROP POLICY IF EXISTS "Super admin can manage traders" ON public.traders;

DROP POLICY IF EXISTS "Users can view own follows" ON public.user_traders;
DROP POLICY IF EXISTS "Users can manage own follows" ON public.user_traders;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Super admin can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Super admin can update transactions" ON public.transactions;

DROP POLICY IF EXISTS "Super admin can manage settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.admin_settings;

DROP POLICY IF EXISTS "Users can view own chart data" ON public.user_chart_data;
DROP POLICY IF EXISTS "Super admin can manage chart data" ON public.user_chart_data;

DROP POLICY IF EXISTS "Users can view own holdings" ON public.user_cryptos;
DROP POLICY IF EXISTS "Super admin can manage holdings" ON public.user_cryptos;

DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Super admin can manage activity" ON public.activity_logs;

DROP POLICY IF EXISTS "Super admin can manage email templates" ON public.email_templates;

DROP POLICY IF EXISTS "Super admin can view email logs" ON public.email_logs;

DROP POLICY IF EXISTS "Super admin can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Super admin can create audit logs" ON public.audit_logs;

-- =============================================================================
-- RECREATE CLEAN RLS POLICIES
-- =============================================================================

-- Super Admin Policies
CREATE POLICY "Super admin can view own record" ON public.super_admin
    FOR SELECT USING (true);

CREATE POLICY "Super admin can update own record" ON public.super_admin
    FOR UPDATE USING (true);

-- Users Policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admin can view all users" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Super admin can update all users" ON public.users
    FOR UPDATE USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Cryptos Policies
CREATE POLICY "Anyone can view active cryptos" ON public.cryptos
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admin can manage cryptos" ON public.cryptos
    FOR ALL USING (true);

-- Traders Policies
CREATE POLICY "Anyone can view active traders" ON public.traders
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Super admin can manage traders" ON public.traders
    FOR ALL USING (true);

-- User Traders Policies
CREATE POLICY "Users can view own follows" ON public.user_traders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own follows" ON public.user_traders
    FOR ALL USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admin can view all transactions" ON public.transactions
    FOR SELECT USING (true);

CREATE POLICY "Super admin can update transactions" ON public.transactions
    FOR UPDATE USING (true);

-- Admin Settings Policies
CREATE POLICY "Super admin can manage settings" ON public.admin_settings
    FOR ALL USING (true);

CREATE POLICY "Anyone can view settings" ON public.admin_settings
    FOR SELECT USING (true);

-- User Chart Data Policies
CREATE POLICY "Users can view own chart data" ON public.user_chart_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage chart data" ON public.user_chart_data
    FOR ALL USING (true);

-- User Cryptos Policies
CREATE POLICY "Users can view own holdings" ON public.user_cryptos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage holdings" ON public.user_cryptos
    FOR ALL USING (true);

-- Activity Logs Policies
CREATE POLICY "Users can view own activity" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin can manage activity" ON public.activity_logs
    FOR ALL USING (true);

-- Email Templates Policies
CREATE POLICY "Super admin can manage email templates" ON public.email_templates
    FOR ALL USING (true);

-- Email Logs Policies
CREATE POLICY "Super admin can view email logs" ON public.email_logs
    FOR SELECT USING (true);

-- Audit Logs Policies
CREATE POLICY "Super admin can view audit logs" ON public.audit_logs
    FOR SELECT USING (true);

CREATE POLICY "Super admin can create audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

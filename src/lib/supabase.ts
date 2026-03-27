import { createClient } from '@supabase/supabase-js';
import type {
  User,
  Crypto,
  Trader,
  Transaction,
  UserCrypto,
  UserChartData,
  ActivityItem,
  AdminSetting,
  DashboardStats,
  UserTrader,
  EmailTemplate,
  EmailLog,
  AuditLog,
  SuperAdmin,
} from '@/types';

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Dynamic redirect URL for email OTP flow
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'http://localhost:5173/auth/callback';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// ============================================
// AUTH OPERATIONS
// ============================================

export async function signUpWithPassword(email: string, password: string, fullName: string) {
  try {
    // Sign up with Supabase Auth
    // The database trigger `handle_new_user` will auto-create the users profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) throw authError;

    // authData.user exists even when email confirmation is required
    // authData.session will be null if email confirmation is required
    if (authData.user) {
      // If session exists, user is already confirmed (email confirmation disabled in Supabase)
      if (authData.session) {
        // Wait briefly for the trigger to create the profile
        await new Promise((resolve) => setTimeout(resolve, 500));
        const userProfile = await getUserById(authData.user.id);
        return { user: userProfile, error: null, needsConfirmation: false };
      }
      // Email confirmation required — user created, awaiting email verify
      return { user: null, error: null, needsConfirmation: true };
    }

    return { user: null, error: null, needsConfirmation: false };
  } catch (error) {
    console.error('[Supabase] Signup error:', error);
    return { user: null, error, needsConfirmation: false };
  }
}

// Alias for backward compatibility
export const signUp = signUpWithPassword;

export async function signInWithOTP(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Sign in with OTP error:', error);
    return { data: null, error };
  }
}

export async function verifyOTP(email: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;

    if (data.user) {
      // Wait for the trigger to create the profile if it doesn't exist yet
      await new Promise((resolve) => setTimeout(resolve, 500));
      const userProfile = await getUserById(data.user.id);
      return { user: userProfile, error: null };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error('[Supabase] Verify OTP error:', error);
    return { user: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile from users table
    if (data.user) {
      const userProfile = await getUserById(data.user.id);
      return { user: userProfile, error: null };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error('[Supabase] Sign in error:', error);
    return { user: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('[Supabase] Sign out error:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (data.user) {
      return await getUserById(data.user.id);
    }

    return null;
  } catch (error) {
    console.error('[Supabase] Get current user error:', error);
    return null;
  }
}

// ============================================
// USER OPERATIONS
// ============================================

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Supabase] Get user error:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('[Supabase] Get user by email error:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'full_name' | 'avatar_url' | 'withdrawal_address'>>
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Supabase] Update user profile error:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get all users error:', error);
    return [];
  }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Update user status error:', error);
    return { data: null, error };
  }
}

export async function updateUserBalance(userId: string, balance: number, profitLoss: number) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ balance, profit_loss: profitLoss })
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('[Supabase] Update user balance error:', error);
    return { error };
  }
}

// ============================================
// CRYPTO OPERATIONS
// ============================================

export async function getCryptos(): Promise<Crypto[]> {
  try {
    const { data, error } = await supabase
      .from('cryptos')
      .select('*')
      .eq('is_active', true)
      .order('market_cap', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get cryptos error:', error);
    return [];
  }
}

export async function getAllCryptos(): Promise<Crypto[]> {
  try {
    const { data, error } = await supabase
      .from('cryptos')
      .select('*')
      .order('market_cap', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get all cryptos error:', error);
    return [];
  }
}

export async function createCrypto(crypto: Omit<Crypto, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('cryptos')
      .insert(crypto)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Create crypto error:', error);
    return { data: null, error };
  }
}

export async function updateCrypto(cryptoId: string, updates: Partial<Crypto>) {
  try {
    const { data, error } = await supabase
      .from('cryptos')
      .update(updates)
      .eq('id', cryptoId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Update crypto error:', error);
    return { data: null, error };
  }
}

export async function deleteCrypto(cryptoId: string) {
  try {
    const { error } = await supabase
      .from('cryptos')
      .update({ is_active: false })
      .eq('id', cryptoId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('[Supabase] Delete crypto error:', error);
    return { error };
  }
}

// ============================================
// TRANSACTION OPERATIONS
// ============================================

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'status'>) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Create transaction error:', error);
    return { data: null, error };
  }
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get user transactions error:', error);
    return [];
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, users(email, full_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get all transactions error:', error);
    return [];
  }
}

export async function updateTransactionStatus(
  transactionId: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status, notes })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Update transaction status error:', error);
    return { data: null, error };
  }
}

// ============================================
// USER CRYPTO OPERATIONS
// ============================================

export async function getUserCryptos(userId: string): Promise<UserCrypto[]> {
  try {
    const { data, error } = await supabase
      .from('user_cryptos')
      .select('*, crypto:cryptos(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get user cryptos error:', error);
    return [];
  }
}

export async function updateUserCrypto(userId: string, cryptoId: string, balance: number) {
  try {
    const { data, error } = await supabase
      .from('user_cryptos')
      .upsert({ user_id: userId, crypto_id: cryptoId, balance })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Update user crypto error:', error);
    return { data: null, error };
  }
}

// ============================================
// USER CHART DATA OPERATIONS
// ============================================

export async function getUserChartData(userId: string): Promise<UserChartData[]> {
  try {
    const { data, error } = await supabase
      .from('user_chart_data')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get user chart data error:', error);
    return [];
  }
}

export async function addUserChartData(userId: string, date: string, value: number) {
  try {
    const { data, error } = await supabase
      .from('user_chart_data')
      .upsert({ user_id: userId, date, value })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Add user chart data error:', error);
    return { data: null, error };
  }
}

// ============================================
// ACTIVITY OPERATIONS
// ============================================

export async function getUserActivity(userId: string): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from('activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get user activity error:', error);
    return [];
  }
}

export async function createActivity(activity: Omit<ActivityItem, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('activity')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Create activity error:', error);
    return { data: null, error };
  }
}

// ============================================
// TRADER OPERATIONS
// ============================================

export async function getTraders(): Promise<Trader[]> {
  try {
    const { data, error } = await supabase
      .from('traders')
      .select('*')
      .eq('is_active', true)
      .order('followers_count', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get traders error:', error);
    return [];
  }
}

export async function getAllTraders(): Promise<Trader[]> {
  try {
    const { data, error } = await supabase
      .from('traders')
      .select('*')
      .order('followers_count', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get all traders error:', error);
    return [];
  }
}

export async function createTrader(trader: Omit<Trader, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('traders')
      .insert(trader)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Create trader error:', error);
    return { data: null, error };
  }
}

export async function updateTrader(traderId: string, updates: Partial<Trader>) {
  try {
    const { data, error } = await supabase
      .from('traders')
      .update(updates)
      .eq('id', traderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Update trader error:', error);
    return { data: null, error };
  }
}

export async function deleteTrader(traderId: string) {
  try {
    const { error } = await supabase
      .from('traders')
      .update({ is_active: false })
      .eq('id', traderId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('[Supabase] Delete trader error:', error);
    return { error };
  }
}

export async function getUserTraders(userId: string): Promise<UserTrader[]> {
  try {
    const { data, error } = await supabase
      .from('user_traders')
      .select('*, trader:traders(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get user traders error:', error);
    return [];
  }
}

export async function followTrader(userId: string, traderId: string) {
  try {
    const { data, error } = await supabase
      .from('user_traders')
      .insert({ user_id: userId, trader_id: traderId })
      .select()
      .single();

    if (error) throw error;

    // Increment followers count
    try {
      const { data: traderData } = await supabase.from('traders').select('followers_count').eq('id', traderId).single();
      if (traderData) {
        await supabase.from('traders').update({ followers_count: (traderData.followers_count || 0) + 1 }).eq('id', traderId);
      }
    } catch {
      // Non-critical: don't fail the follow if counter update fails
    }

    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Follow trader error:', error);
    return { data: null, error };
  }
}

export async function unfollowTrader(userId: string, traderId: string) {
  try {
    const { error } = await supabase
      .from('user_traders')
      .delete()
      .eq('user_id', userId)
      .eq('trader_id', traderId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('[Supabase] Unfollow trader error:', error);
    return { error };
  }
}

// ============================================
// ADMIN SETTINGS OPERATIONS
// ============================================

export async function getAdminSettings(): Promise<AdminSetting[]> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .order('key');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get admin settings error:', error);
    return [];
  }
}

export async function updateAdminSetting(key: string, value: string) {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Update admin setting error:', error);
    return { data: null, error };
  }
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const [usersResult, transactionsResult, tradersResult] = await Promise.all([
      supabase.from('users').select('id, balance, status', { count: 'exact' }),
      supabase.from('transactions').select('amount, type, status', { count: 'exact' }),
      supabase.from('traders').select('id', { count: 'exact' }).eq('is_active', true),
    ]);

    const users = usersResult.data || [];
    const transactions = transactionsResult.data || [];
    const activeTraders = tradersResult.count || 0;

    const totalUsers = usersResult.count || 0;
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const totalBalance = users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);

    const pendingDeposits = transactions.filter(
      (t) => t.type === 'deposit' && t.status === 'pending'
    ).length;
    const pendingWithdrawals = transactions.filter(
      (t) => t.type === 'withdrawal' && t.status === 'pending'
    ).length;
    const totalVolume = transactions
      .filter((t) => t.status === 'approved')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      totalUsers,
      activeUsers,
      totalBalance,
      pendingDeposits,
      pendingWithdrawals,
      totalVolume,
      activeTraders,
    };
  } catch (error) {
    console.error('[Supabase] Get dashboard stats error:', error);
    return null;
  }
}

// ============================================
// EMAIL OPERATIONS
// ============================================

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get email templates error:', error);
    return [];
  }
}

export async function updateEmailTemplate(templateId: string, updates: Partial<EmailTemplate>) {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Update email template error:', error);
    return { data: null, error };
  }
}

export async function createEmailLog(emailLog: Omit<EmailLog, 'id' | 'sent_at'>) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .insert(emailLog)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Create email log error:', error);
    return { data: null, error };
  }
}

export async function getEmailLogs(): Promise<EmailLog[]> {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get email logs error:', error);
    return [];
  }
}

// ============================================
// AUDIT LOG OPERATIONS
// ============================================

export async function createAuditLog(auditLog: Omit<AuditLog, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(auditLog)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Create audit log error:', error);
    return { data: null, error };
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get audit logs error:', error);
    return [];
  }
}

// ============================================
// SUPER ADMIN OPERATIONS
// ============================================

export async function adminLogin(username: string, password: string) {
  try {
    const { data: adminData, error: fetchError } = await supabase
      .from('super_admin')
      .select('*')
      .eq('username', username)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return { admin: null, error: new Error('Admin not found') };
      }
      throw fetchError;
    }

    if (!adminData) {
      return { admin: null, error: new Error('Admin not found') };
    }

    const passwordValid = await verifyPassword(password, adminData.password_hash);

    if (!passwordValid) {
      return { admin: null, error: new Error('Invalid password') };
    }

    await supabase
      .from('super_admin')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminData.id);

    await createAuditLog({
      action: 'admin_login',
      admin_id: adminData.id,
      entity_type: 'super_admin',
      entity_id: adminData.id,
    });

    return {
      admin: {
        id: adminData.id,
        username: adminData.username,
        full_name: adminData.full_name,
        last_login: adminData.last_login,
      },
      error: null,
    };
  } catch (error) {
    console.error('[Supabase] Admin login error:', error);
    return { admin: null, error };
  }
}

export async function updateAdminPassword(adminId: string, currentPassword: string, newPassword: string) {
  try {
    const { data: adminData, error: fetchError } = await supabase
      .from('super_admin')
      .select('*')
      .eq('id', adminId)
      .single();

    if (fetchError) throw fetchError;

    const passwordValid = await verifyPassword(currentPassword, adminData.password_hash);

    if (!passwordValid) {
      return { error: new Error('Current password is incorrect') };
    }

    const newPasswordHash = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from('super_admin')
      .update({ password_hash: newPasswordHash })
      .eq('id', adminId);

    if (updateError) throw updateError;

    await createAuditLog({
      action: 'admin_password_change',
      admin_id: adminId,
      entity_type: 'super_admin',
      entity_id: adminId,
    });

    return { error: null };
  } catch (error) {
    console.error('[Supabase] Update admin password error:', error);
    return { error };
  }
}

export async function getSuperAdmin(adminId: string): Promise<SuperAdmin | null> {
  try {
    const { data, error } = await supabase
      .from('super_admin')
      .select('id, username, full_name, last_login, created_at, updated_at')
      .eq('id', adminId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('[Supabase] Get super admin error:', error);
    return null;
  }
}

// ============================================
// PASSWORD HASHING UTILITIES
// ============================================

async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `$sha256$${hashHex}`;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const computedHash = await hashPassword(password);
    return computedHash === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

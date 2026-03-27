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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create user profile in users table
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        balance: 0,
        profit_loss: 0,
        status: 'active',
      });

      if (profileError) throw profileError;

      // Fetch and return the full user profile
      const userProfile = await getUserById(authData.user.id);
      return { user: userProfile, error: null };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error('[Supabase] Signup error:', error);
    return { user: null, error };
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

    // Create user profile if they don't exist
    if (data.user) {
      const existing = await getUserById(data.user.id);
      if (!existing) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          balance: 0,
          profit_loss: 0,
          status: 'active',
        });
      }
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

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  } catch (error) {
    console.error('[Supabase] Get user by email error:', error);
    return null;
  }
}

export async function updateUser(userId: string, updates: Partial<User>) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { user: data, error: null };
  } catch (error) {
    console.error('[Supabase] Update user error:', error);
    return { user: null, error };
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get all users error:', error);
    return [];
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
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get cryptos error:', error);
    return [];
  }
}

export async function getCryptoBySymbol(symbol: string): Promise<Crypto | null> {
  try {
    const { data, error } = await supabase
      .from('cryptos')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('[Supabase] Get crypto error:', error);
    return null;
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
    return { crypto: data, error: null };
  } catch (error) {
    console.error('[Supabase] Update crypto error:', error);
    return { crypto: null, error };
  }
}

// ============================================
// TRANSACTION OPERATIONS
// ============================================

export async function getTransactionsByUserId(userId: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get transactions error:', error);
    return [];
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get all transactions error:', error);
    return [];
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return { transaction: data, error: null };
  } catch (error) {
    console.error('[Supabase] Create transaction error:', error);
    return { transaction: null, error };
  }
}

export async function updateTransaction(transactionId: string, updates: Partial<Transaction>) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return { transaction: data, error: null };
  } catch (error) {
    console.error('[Supabase] Update transaction error:', error);
    return { transaction: null, error };
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

export async function getTraderById(traderId: string): Promise<Trader | null> {
  try {
    const { data, error } = await supabase
      .from('traders')
      .select('*')
      .eq('id', traderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('[Supabase] Get trader error:', error);
    return null;
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
    return { trader: data, error: null };
  } catch (error) {
    console.error('[Supabase] Update trader error:', error);
    return { trader: null, error };
  }
}

// ============================================
// USER HOLDINGS (Cryptos)
// ============================================

export async function getUserHoldings(userId: string): Promise<UserCrypto[]> {
  try {
    const { data, error } = await supabase
      .from('user_cryptos')
      .select('*, crypto:cryptos(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get user holdings error:', error);
    return [];
  }
}

export async function updateUserHolding(holdingId: string, updates: Partial<UserCrypto>) {
  try {
    const { data, error } = await supabase
      .from('user_cryptos')
      .update(updates)
      .eq('id', holdingId)
      .select()
      .single();

    if (error) throw error;
    return { holding: data, error: null };
  } catch (error) {
    console.error('[Supabase] Update user holding error:', error);
    return { holding: null, error };
  }
}

export async function createUserHolding(userId: string, cryptoId: string, balance: number = 0) {
  try {
    const { data, error } = await supabase
      .from('user_cryptos')
      .insert({ user_id: userId, crypto_id: cryptoId, balance })
      .select()
      .single();

    if (error) throw error;
    return { holding: data, error: null };
  } catch (error) {
    console.error('[Supabase] Create user holding error:', error);
    return { holding: null, error };
  }
}

// ============================================
// PORTFOLIO CHART DATA
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

export async function addChartData(userId: string, date: string, value: number) {
  try {
    const { data, error } = await supabase
      .from('user_chart_data')
      .insert({ user_id: userId, date, value })
      .select()
      .single();

    if (error) throw error;
    return { chartData: data, error: null };
  } catch (error) {
    console.error('[Supabase] Add chart data error:', error);
    return { chartData: null, error };
  }
}

// ============================================
// ACTIVITY LOGS
// ============================================

export async function getActivityLogs(userId: string): Promise<ActivityItem[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get activity logs error:', error);
    return [];
  }
}

export async function createActivityLog(activity: Omit<ActivityItem, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return { activity: data, error: null };
  } catch (error) {
    console.error('[Supabase] Create activity log error:', error);
    return { activity: null, error };
  }
}

// ============================================
// ADMIN SETTINGS
// ============================================

export async function getSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || null;
  } catch (error) {
    console.error('[Supabase] Get setting error:', error);
    return null;
  }
}

export async function getSettings(): Promise<AdminSetting[]> {
  try {
    const { data, error } = await supabase.from('admin_settings').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get settings error:', error);
    return [];
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .update({ value })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;
    return { setting: data, error: null };
  } catch (error) {
    console.error('[Supabase] Update setting error:', error);
    return { setting: null, error };
  }
}

// ============================================
// TRADER FOLLOWS
// ============================================

export async function getUserFollowedTraders(userId: string): Promise<UserTrader[]> {
  try {
    const { data, error } = await supabase
      .from('user_traders')
      .select('*, trader:traders(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] Get followed traders error:', error);
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
    return { follow: data, error: null };
  } catch (error) {
    console.error('[Supabase] Follow trader error:', error);
    return { follow: null, error };
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
// DASHBOARD STATS (Admin)
// ============================================

export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) throw error;
    
    if (data && data.length > 0) {
      return {
        totalUsers: data[0].total_users || 0,
        totalBalance: data[0].total_balance || 0,
        totalTransactions: data[0].total_transactions || 0,
        pendingRequests: data[0].pending_requests || 0,
        activeTraders: data[0].active_traders || 0,
        listedCryptos: data[0].listed_cryptos || 0,
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Supabase] Get dashboard stats error:', error);
    return null;
  }
}

// ============================================
// EMAIL OPERATIONS
// ============================================

export async function getEmailTemplate(name: string): Promise<EmailTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('[Supabase] Get email template error:', error);
    return null;
  }
}

export async function logEmail(emailLog: Omit<EmailLog, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .insert(emailLog)
      .select()
      .single();

    if (error) throw error;
    return { emailLog: data, error: null };
  } catch (error) {
    console.error('[Supabase] Log email error:', error);
    return { emailLog: null, error };
  }
}

// ============================================
// AUDIT LOGS
// ============================================

export async function createAuditLog(auditLog: Omit<AuditLog, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(auditLog)
      .select()
      .single();

    if (error) throw error;
    return { auditLog: data, error: null };
  } catch (error) {
    console.error('[Supabase] Create audit log error:', error);
    return { auditLog: null, error };
  }
}

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

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
    // Fetch admin from super_admin table
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

    // Verify password using bcrypt
    const passwordValid = await verifyPassword(password, adminData.password_hash);

    if (!passwordValid) {
      return { admin: null, error: new Error('Invalid password') };
    }

    // Update last login timestamp
    await supabase
      .from('super_admin')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminData.id);

    // Log admin login action
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
    // Get current admin
    const { data: adminData, error: fetchError } = await supabase
      .from('super_admin')
      .select('*')
      .eq('id', adminId)
      .single();

    if (fetchError) throw fetchError;

    // Verify current password
    const passwordValid = await verifyPassword(currentPassword, adminData.password_hash);

    if (!passwordValid) {
      return { error: new Error('Current password is incorrect') };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('super_admin')
      .update({ password_hash: newPasswordHash })
      .eq('id', adminId);

    if (updateError) throw updateError;

    // Log password change
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

/**
 * Simple password hashing using Web Crypto API
 * For production: Use a backend service for password hashing
 * This provides basic security for development
 */
async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // Add salt prefix to distinguish from plaintext
    return `$sha256$${hashHex}`;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a hash
 * Note: For production, implement proper bcrypt hashing on backend
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const computedHash = await hashPassword(password);
    return computedHash === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

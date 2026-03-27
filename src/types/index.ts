// Database Types for Vested Crypto Trading Platform

// ============================================
// SUPER ADMIN TYPES
// ============================================

export interface SuperAdmin {
  id: string;
  username: string;
  password_hash?: string;
  full_name: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  balance: number;
  profit_loss: number;
  withdrawal_address: string | null;
  is_admin: boolean;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

// ============================================
// CRYPTO TYPES
// ============================================

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  icon_url: string | null;
  price: number;
  staking_apy: number;
  change_24h: number;
  market_cap: number;
  volume_24h: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// TRADER TYPES
// ============================================

export interface PerformanceDataPoint {
  date: string;
  value: number;
}

export interface Trader {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  total_profit_loss: number;
  profit_loss_percentage: number;
  followers_count: number;
  performance_data: PerformanceDataPoint[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserTrader {
  id: string;
  user_id: string;
  trader_id: string;
  followed_at: string;
  trader?: Trader;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  crypto_symbol?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface AdminSetting {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface UserChartData {
  id: string;
  user_id: string;
  date: string;
  value: number;
  created_at: string;
}

export interface UserCrypto {
  id: string;
  user_id: string;
  crypto_id: string;
  balance: number;
  staked_amount: number;
  crypto?: Crypto;
}

export interface PortfolioData {
  date: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  user_id?: string;
  type: 'receive' | 'send' | 'stake' | 'unstake' | 'trade';
  amount: number;
  crypto_symbol: string;
  usd_value?: number;
  timestamp: string;
  description?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalBalance: number;
  totalTransactions: number;
  pendingRequests: number;
  activeTraders: number;
  listedCryptos: number;
}

export interface MarketOverview {
  globalMarketCap: number;
  volume24h: number;
  btcDominance: number;
  fearGreedIndex: number;
}

// ============================================
// EMAIL NOTIFICATION TYPES
// ============================================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
}

export interface EmailLog {
  id: string;
  user_id: string;
  template_id: string;
  to_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at?: string;
  error_message?: string;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface AuditLog {
  id: string;
  user_id?: string;
  admin_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

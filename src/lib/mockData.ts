// Mock Data Service for Vested Platform
// This simulates Supabase for the static-first prototype

import type { 
  User, 
  Crypto, 
  Trader, 
  Transaction, 
  AdminSetting,
  UserChartData,
  UserTrader,
  DashboardStats,
  MarketOverview,
  ActivityItem,
  PerformanceDataPoint,
  SuperAdmin,
  AdminCredentials
} from '@/types';

// ============================================
// SUPER ADMIN CONFIGURATION
// ============================================
// DEFAULT CREDENTIALS (Change these in production!)
// Username: admin
// Password: VestedAdmin2024!
// 
// To change credentials, update the values below or use the 
// admin settings panel after logging in

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'VestedAdmin2024!';

// Super Admin Account (Stored separately from regular users)
export let superAdmin: SuperAdmin = {
  id: 'super-admin-001',
  username: DEFAULT_ADMIN_USERNAME,
  password_hash: DEFAULT_ADMIN_PASSWORD, // In production, this would be bcrypt hashed
  full_name: 'Super Administrator',
  last_login: undefined,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ============================================
// MOCK USERS (Regular users only - no admin here)
// ============================================
export const mockUsers: User[] = [
  {
    id: '2',
    email: 'john.doe@example.com',
    full_name: 'John Doe',
    avatar_url: null,
    balance: 200000,
    profit_loss: 25000,
    withdrawal_address: 'bc1q2wrnatsqn06mtyycfkaqju6esagj9qf9ahnteh',
    is_admin: false,
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '3',
    email: 'sarah.chen@example.com',
    full_name: 'Sarah Chen',
    avatar_url: null,
    balance: 85000,
    profit_loss: 12000,
    withdrawal_address: '0x573A5372003e44Eb2E0F02DC5E31442a551b4904',
    is_admin: false,
    status: 'active',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-03-18T00:00:00Z',
  },
  {
    id: '4',
    email: 'mike.roberts@example.com',
    full_name: 'Mike Roberts',
    avatar_url: null,
    balance: 45000,
    profit_loss: -3000,
    withdrawal_address: null,
    is_admin: false,
    status: 'active',
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
  },
  {
    id: '5',
    email: 'emma.watson@example.com',
    full_name: 'Emma Watson',
    avatar_url: null,
    balance: 120000,
    profit_loss: 18000,
    withdrawal_address: 'ltc1quyc8m29nwe0rrxr94d0t9968fdaevn0fzw94wd',
    is_admin: false,
    status: 'suspended',
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
  },
];

// Mock Cryptocurrencies
export const mockCryptos: Crypto[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon_url: null,
    price: 64230,
    staking_apy: 4.5,
    change_24h: 2.4,
    market_cap: 1260000000000,
    volume_24h: 35000000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    icon_url: null,
    price: 3450,
    staking_apy: 5.2,
    change_24h: 1.8,
    market_cap: 415000000000,
    volume_24h: 18000000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '3',
    name: 'Litecoin',
    symbol: 'LTC',
    icon_url: null,
    price: 78.50,
    staking_apy: 3.8,
    change_24h: -0.5,
    market_cap: 5800000000,
    volume_24h: 450000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '4',
    name: 'Bitcoin Cash',
    symbol: 'BCH',
    icon_url: null,
    price: 345,
    staking_apy: 2.5,
    change_24h: 0.8,
    market_cap: 6800000000,
    volume_24h: 280000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '5',
    name: 'Cardano',
    symbol: 'ADA',
    icon_url: null,
    price: 0.45,
    staking_apy: 4.8,
    change_24h: 5.2,
    market_cap: 16000000000,
    volume_24h: 520000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '6',
    name: 'Stellar',
    symbol: 'XLM',
    icon_url: null,
    price: 0.12,
    staking_apy: 3.2,
    change_24h: -1.2,
    market_cap: 3500000000,
    volume_24h: 120000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '7',
    name: 'Solana',
    symbol: 'SOL',
    icon_url: null,
    price: 145,
    staking_apy: 6.5,
    change_24h: 5.2,
    market_cap: 65000000000,
    volume_24h: 2800000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '8',
    name: 'BNB',
    symbol: 'BNB',
    icon_url: null,
    price: 590,
    staking_apy: 4.0,
    change_24h: -0.5,
    market_cap: 88000000000,
    volume_24h: 1200000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '9',
    name: 'XRP',
    symbol: 'XRP',
    icon_url: null,
    price: 0.62,
    staking_apy: 2.8,
    change_24h: -1.2,
    market_cap: 34000000000,
    volume_24h: 1800000000,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
];

// Mock Traders
export const mockTraders: Trader[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    avatar_url: null,
    bio: 'Professional crypto trader with 8+ years experience. Specializing in BTC and ETH strategies.',
    total_profit_loss: 245000,
    profit_loss_percentage: 145,
    followers_count: 1247,
    performance_data: generatePerformanceData(145),
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Garcia',
    avatar_url: null,
    bio: 'DeFi specialist focusing on yield farming and staking strategies.',
    total_profit_loss: 189000,
    profit_loss_percentage: 98,
    followers_count: 892,
    performance_data: generatePerformanceData(98),
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '3',
    name: 'David Kim',
    avatar_url: null,
    bio: 'Altcoin expert with a focus on emerging blockchain technologies.',
    total_profit_loss: 156000,
    profit_loss_percentage: 87,
    followers_count: 654,
    performance_data: generatePerformanceData(87),
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '4',
    name: 'Lisa Wang',
    avatar_url: null,
    bio: 'Quantitative trader using algorithmic strategies for consistent returns.',
    total_profit_loss: 312000,
    profit_loss_percentage: 203,
    followers_count: 2156,
    performance_data: generatePerformanceData(203),
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: '5',
    name: 'James Wilson',
    avatar_url: null,
    bio: 'Long-term investor with a focus on fundamental analysis.',
    total_profit_loss: 78000,
    profit_loss_percentage: 42,
    followers_count: 423,
    performance_data: generatePerformanceData(42),
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    user_id: '2',
    type: 'deposit',
    amount: 50000,
    crypto_symbol: 'BTC',
    address: 'bc1q2wrnatsqn06mtyycfkaqju6esagj9qf9ahnteh',
    status: 'approved',
    notes: 'Initial deposit',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    user_id: '2',
    type: 'deposit',
    amount: 150000,
    crypto_symbol: 'ETH',
    address: '0x573A5372003e44Eb2E0F02DC5E31442a551b4904',
    status: 'approved',
    notes: 'Second deposit',
    created_at: '2024-02-01T14:00:00Z',
    updated_at: '2024-02-01T14:20:00Z',
  },
  {
    id: '3',
    user_id: '3',
    type: 'withdrawal',
    amount: 5000,
    crypto_symbol: 'ETH',
    address: '0x573A5372003e44Eb2E0F02DC5E31442a551b4904',
    status: 'pending',
    notes: undefined,
    created_at: '2024-03-19T09:00:00Z',
    updated_at: '2024-03-19T09:00:00Z',
  },
  {
    id: '4',
    user_id: '4',
    type: 'deposit',
    amount: 25000,
    crypto_symbol: 'BTC',
    address: 'bc1q2wrnatsqn06mtyycfkaqju6esagj9qf9ahnteh',
    status: 'pending',
    notes: undefined,
    created_at: '2024-03-20T11:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
  },
  {
    id: '5',
    user_id: '2',
    type: 'withdrawal',
    amount: 10000,
    crypto_symbol: 'USDT',
    address: '0x573A5372003e44Eb2E0F02DC5E31442a551b4904',
    status: 'approved',
    notes: 'Monthly withdrawal',
    created_at: '2024-03-10T16:00:00Z',
    updated_at: '2024-03-10T16:30:00Z',
  },
  {
    id: '6',
    user_id: '5',
    type: 'withdrawal',
    amount: 15000,
    crypto_symbol: 'LTC',
    address: 'ltc1quyc8m29nwe0rrxr94d0t9968fdaevn0fzw94wd',
    status: 'rejected',
    notes: 'Account suspended',
    created_at: '2024-03-18T13:00:00Z',
    updated_at: '2024-03-18T13:15:00Z',
  },
];

// Mock Admin Settings
export const mockAdminSettings: AdminSetting[] = [
  {
    id: '1',
    key: 'platform_name',
    value: 'Vested',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    key: 'deposit_address_btc',
    value: 'bc1q2wrnatsqn06mtyycfkaqju6esagj9qf9ahnteh',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    key: 'deposit_address_eth',
    value: '0x573A5372003e44Eb2E0F02DC5E31442a551b4904',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    key: 'withdrawal_fee_btc',
    value: '0.0005',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    key: 'withdrawal_fee_eth',
    value: '0.005',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    key: 'min_withdrawal_btc',
    value: '0.001',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    key: 'min_withdrawal_eth',
    value: '0.01',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock User-Trader Relationships
export const mockUserTraders: UserTrader[] = [
  {
    id: '1',
    user_id: '2',
    trader_id: '1',
    followed_at: '2024-02-01T00:00:00Z',
    trader: mockTraders[0],
  },
  {
    id: '2',
    user_id: '2',
    trader_id: '4',
    followed_at: '2024-02-15T00:00:00Z',
    trader: mockTraders[3],
  },
  {
    id: '3',
    user_id: '3',
    trader_id: '2',
    followed_at: '2024-02-10T00:00:00Z',
    trader: mockTraders[1],
  },
  {
    id: '4',
    user_id: '4',
    trader_id: '3',
    followed_at: '2024-03-01T00:00:00Z',
    trader: mockTraders[2],
  },
];

// Mock User Chart Data
export const mockUserChartData: UserChartData[] = generateUserChartData('2');

// Mock Activity Items
export const mockActivityItems: ActivityItem[] = [
  {
    id: '1',
    type: 'receive',
    amount: 0.1,
    crypto_symbol: 'BTC',
    usd_value: 6423,
    timestamp: '2024-03-20T14:00:00Z',
    description: 'Received from external wallet',
  },
  {
    id: '2',
    type: 'stake',
    amount: 2,
    crypto_symbol: 'ETH',
    usd_value: 6900,
    timestamp: '2024-03-20T11:00:00Z',
    description: 'Staked for 5.2% APY',
  },
  {
    id: '3',
    type: 'send',
    amount: 1000,
    crypto_symbol: 'USDT',
    usd_value: 1000,
    timestamp: '2024-03-19T16:00:00Z',
    description: 'Withdrawal to bank',
  },
  {
    id: '4',
    type: 'receive',
    amount: 500,
    crypto_symbol: 'ADA',
    usd_value: 225,
    timestamp: '2024-03-18T09:00:00Z',
    description: 'Staking rewards',
  },
];

// Helper function to generate performance data
function generatePerformanceData(totalReturn: number): PerformanceDataPoint[] {
  const data: PerformanceDataPoint[] = [];
  const days = 30;
  let value = 100;
  const dailyReturn = totalReturn / days;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const randomVariation = (Math.random() - 0.5) * 2;
    value = value * (1 + (dailyReturn + randomVariation) / 100);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    });
  }
  
  return data;
}

// Helper function to generate user chart data
function generateUserChartData(userId: string): UserChartData[] {
  const data: UserChartData[] = [];
  const days = 30;
  let value = 175000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.3) * 5000;
    value += change;
    data.push({
      id: `${userId}-${i}`,
      user_id: userId,
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      created_at: date.toISOString(),
    });
  }
  
  return data;
}

// Dashboard Stats
export const getDashboardStats = (): DashboardStats => ({
  totalUsers: mockUsers.filter(u => !u.is_admin).length,
  totalBalance: mockUsers.reduce((acc, u) => acc + u.balance, 0),
  totalTransactions: mockTransactions.length,
  pendingRequests: mockTransactions.filter(t => t.status === 'pending').length,
  activeTraders: mockTraders.filter(t => t.is_active).length,
  listedCryptos: mockCryptos.filter(c => c.is_active).length,
});

// Market Overview
export const getMarketOverview = (): MarketOverview => ({
  globalMarketCap: 2400000000000,
  volume24h: 98200000000,
  btcDominance: 52.4,
  fearGreedIndex: 72,
});

// ============================================
// MOCK API FUNCTIONS
// ============================================

export const mockApi = {
  // ============================================
  // SUPER ADMIN AUTHENTICATION
  // ============================================
  
  // Login as Super Admin (username/password based)
  adminLogin: async (credentials: AdminCredentials): Promise<SuperAdmin | null> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check credentials against stored super admin
    if (credentials.username === superAdmin.username && 
        credentials.password === superAdmin.password_hash) {
      // Update last login
      superAdmin.last_login = new Date().toISOString();
      return superAdmin;
    }
    return null;
  },
  
  // Update Super Admin credentials (only accessible when already logged in as admin)
  updateAdminCredentials: async (
    currentPassword: string, 
    newCredentials: Partial<AdminCredentials>
  ): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify current password
    if (currentPassword !== superAdmin.password_hash) {
      return false;
    }
    
    // Update credentials
    if (newCredentials.username) {
      superAdmin.username = newCredentials.username;
    }
    if (newCredentials.password) {
      superAdmin.password_hash = newCredentials.password;
    }
    superAdmin.updated_at = new Date().toISOString();
    
    return true;
  },
  
  // Get current admin info
  getAdminInfo: async (): Promise<SuperAdmin | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return superAdmin;
  },
  
  // ============================================
  // USER AUTHENTICATION
  // ============================================
  
  login: async (email: string, _password: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      return user;
    }
    return null;
  },
  
  signup: async (email: string, _password: string, fullName: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email,
      full_name: fullName,
      avatar_url: null,
      balance: 0,
      profit_loss: 0,
      withdrawal_address: null,
      is_admin: false,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },
  
  // ============================================
  // USERS MANAGEMENT
  // ============================================
  
  getUsers: async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers.filter(u => !u.is_admin);
  },
  
  getUserById: async (id: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(u => u.id === id) || null;
  },
  
  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...updates, updated_at: new Date().toISOString() };
      return mockUsers[index];
    }
    return null;
  },
  
  // ============================================
  // CRYPTOCURRENCIES MANAGEMENT
  // ============================================
  
  getCryptos: async (): Promise<Crypto[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCryptos;
  },
  
  updateCrypto: async (id: string, updates: Partial<Crypto>): Promise<Crypto | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockCryptos.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCryptos[index] = { ...mockCryptos[index], ...updates, updated_at: new Date().toISOString() };
      return mockCryptos[index];
    }
    return null;
  },
  
  addCrypto: async (crypto: Omit<Crypto, 'id' | 'created_at' | 'updated_at'>): Promise<Crypto> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCrypto: Crypto = {
      ...crypto,
      id: String(mockCryptos.length + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCryptos.push(newCrypto);
    return newCrypto;
  },
  
  // ============================================
  // TRADERS MANAGEMENT
  // ============================================
  
  getTraders: async (): Promise<Trader[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTraders;
  },
  
  updateTrader: async (id: string, updates: Partial<Trader>): Promise<Trader | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTraders.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTraders[index] = { ...mockTraders[index], ...updates, updated_at: new Date().toISOString() };
      return mockTraders[index];
    }
    return null;
  },
  
  addTrader: async (trader: Omit<Trader, 'id' | 'created_at' | 'updated_at'>): Promise<Trader> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newTrader: Trader = {
      ...trader,
      id: String(mockTraders.length + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTraders.push(newTrader);
    return newTrader;
  },
  
  // ============================================
  // TRANSACTIONS MANAGEMENT
  // ============================================
  
  getTransactions: async (): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  
  getUserTransactions: async (userId: string): Promise<Transaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTransactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  
  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTransactions[index] = { 
        ...mockTransactions[index], 
        ...updates, 
        updated_at: new Date().toISOString() 
      };
      return mockTransactions[index];
    }
    return null;
  },
  
  createTransaction: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newTransaction: Transaction = {
      ...transaction,
      id: String(mockTransactions.length + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  },
  
  // ============================================
  // USER TRADERS (FOLLOWING)
  // ============================================
  
  getUserTraders: async (userId: string): Promise<UserTrader[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUserTraders.filter(ut => ut.user_id === userId);
  },
  
  followTrader: async (userId: string, traderId: string): Promise<UserTrader> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUserTrader: UserTrader = {
      id: String(mockUserTraders.length + 1),
      user_id: userId,
      trader_id: traderId,
      followed_at: new Date().toISOString(),
      trader: mockTraders.find(t => t.id === traderId),
    };
    mockUserTraders.push(newUserTrader);
    
    // Update trader followers count
    const traderIndex = mockTraders.findIndex(t => t.id === traderId);
    if (traderIndex !== -1) {
      mockTraders[traderIndex].followers_count += 1;
    }
    
    return newUserTrader;
  },
  
  unfollowTrader: async (userId: string, traderId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockUserTraders.findIndex(ut => ut.user_id === userId && ut.trader_id === traderId);
    if (index !== -1) {
      mockUserTraders.splice(index, 1);
      
      // Update trader followers count
      const traderIndex = mockTraders.findIndex(t => t.id === traderId);
      if (traderIndex !== -1) {
        mockTraders[traderIndex].followers_count = Math.max(0, mockTraders[traderIndex].followers_count - 1);
      }
    }
  },
  
  // ============================================
  // SETTINGS MANAGEMENT
  // ============================================
  
  getSettings: async (): Promise<AdminSetting[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAdminSettings;
  },
  
  updateSetting: async (key: string, value: string): Promise<AdminSetting | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAdminSettings.findIndex(s => s.key === key);
    if (index !== -1) {
      mockAdminSettings[index] = { 
        ...mockAdminSettings[index], 
        value, 
        updated_at: new Date().toISOString() 
      };
      return mockAdminSettings[index];
    }
    return null;
  },
  
  // ============================================
  // CHART DATA
  // ============================================
  
  getUserChartData: async (_userId: string): Promise<UserChartData[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUserChartData;
  },
  
  // ============================================
  // ACTIVITY
  // ============================================
  
  getUserActivity: async (_userId: string): Promise<ActivityItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockActivityItems;
  },
};

export default mockApi;

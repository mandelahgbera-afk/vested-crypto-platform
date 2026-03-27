import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Page } from '@/App';
import type { User, Crypto, Trader, Transaction, AdminSetting, DashboardStats } from '@/types';
import {
  getAllUsers, getAllCryptos, getAllTraders, getAllTransactions,
  getAdminSettings, getDashboardStats, updateUserStatus, updateUserBalance,
  createCrypto, updateCrypto,
  createTrader, updateTrader,
  updateTransactionStatus, updateAdminSetting,
} from '@/lib/supabase';
import {
  LayoutDashboard, Users, Coins, UserCheck, History, Settings,
  LogOut, Activity
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminCryptos from './AdminCryptos';
import AdminTraders from './AdminTraders';
import AdminTransactions from './AdminTransactions';
import AdminSettings from './AdminSettings';

interface AdminDashboardProps {
  onNavigate: (page: Page) => void;
}

type AdminTab = 'overview' | 'users' | 'cryptos' | 'traders' | 'transactions' | 'settings';

const navItems = [
  { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
  { id: 'users' as AdminTab, label: 'Users', icon: Users },
  { id: 'cryptos' as AdminTab, label: 'Cryptocurrencies', icon: Coins },
  { id: 'traders' as AdminTab, label: 'Copy Traders', icon: UserCheck },
  { id: 'transactions' as AdminTab, label: 'Transactions', icon: History },
  { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
];

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { adminLogout } = useAuth();
  const { showToast } = useToast();

  const [_isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalBalance: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalVolume: 0,
    activeTraders: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, cryptosData, tradersData, transactionsData, settingsData, statsData] = await Promise.all([
        getAllUsers(),
        getAllCryptos(),
        getAllTraders(),
        getAllTransactions(),
        getAdminSettings(),
        getDashboardStats(),
      ]);

      setUsers(usersData);
      setCryptos(cryptosData);
      setTraders(tradersData);
      setTransactions(transactionsData);
      setSettings(settingsData);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      showToast('Failed to load admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      if (updates.status) {
        await updateUserStatus(userId, updates.status);
      }
      if (updates.balance !== undefined || updates.profit_loss !== undefined) {
        const user = users.find((u) => u.id === userId);
        await updateUserBalance(
          userId,
          updates.balance ?? user?.balance ?? 0,
          updates.profit_loss ?? user?.profit_loss ?? 0
        );
      }
      showToast('User updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update user', 'error');
    }
  };

  const handleUpdateCrypto = async (cryptoId: string, updates: Partial<Crypto>) => {
    try {
      await updateCrypto(cryptoId, updates);
      showToast('Cryptocurrency updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update cryptocurrency', 'error');
    }
  };

  const handleAddCrypto = async (crypto: Omit<Crypto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createCrypto(crypto);
      showToast('Cryptocurrency added successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to add cryptocurrency', 'error');
    }
  };

  const handleUpdateTrader = async (traderId: string, updates: Partial<Trader>) => {
    try {
      await updateTrader(traderId, updates);
      showToast('Trader updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update trader', 'error');
    }
  };

  const handleAddTrader = async (trader: Omit<Trader, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createTrader(trader);
      showToast('Trader added successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to add trader', 'error');
    }
  };

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      await updateTransactionStatus(transactionId, 'approved');
      showToast('Transaction approved', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to approve transaction', 'error');
    }
  };

  const handleRejectTransaction = async (transactionId: string, reason: string) => {
    try {
      await updateTransactionStatus(transactionId, 'rejected', reason);
      showToast('Transaction rejected', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to reject transaction', 'error');
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await updateAdminSetting(key, value);
      showToast('Setting updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update setting', 'error');
    }
  };

  const handleLogout = () => {
    adminLogout();
    onNavigate('landing');
  };

  // Map DashboardStats to AdminOverview-compatible format
  const overviewStats = {
    totalUsers: stats.totalUsers,
    totalBalance: stats.totalBalance,
    totalTransactions: transactions.length,
    pendingRequests: stats.pendingDeposits + stats.pendingWithdrawals,
    activeTraders: stats.activeTraders,
    listedCryptos: cryptos.filter((c) => c.is_active).length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AdminOverview
            stats={overviewStats}
            recentTransactions={transactions.slice(0, 10)}
          />
        );
      case 'users':
        return (
          <AdminUsers
            users={users}
            onUpdate={handleUpdateUser}
          />
        );
      case 'cryptos':
        return (
          <AdminCryptos
            cryptos={cryptos}
            onUpdate={handleUpdateCrypto}
            onAdd={handleAddCrypto}
          />
        );
      case 'traders':
        return (
          <AdminTraders
            traders={traders}
            onUpdate={handleUpdateTrader}
            onAdd={handleAddTrader}
          />
        );
      case 'transactions':
        return (
          <AdminTransactions
            transactions={transactions}
            onUpdate={(txId, updates) => {
              if (updates.status === 'approved') handleApproveTransaction(txId);
              else if (updates.status === 'rejected') handleRejectTransaction(txId, updates.notes || '');
            }}
          />
        );
      case 'settings':
        return (
          <AdminSettings
            settings={settings}
            onUpdate={handleUpdateSetting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0C111D] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#070B13] border-r border-white/5 flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm">Vested Admin</p>
              <p className="text-xs text-[#A5ACBA]">Super Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="sidebar-nav-item w-full text-[#F04438] hover:text-[#F04438] hover:bg-[#F04438]/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 px-8 py-4 bg-[#0C111D]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#17B26A]/20 text-[#17B26A] rounded-full text-sm">
                <Activity className="w-4 h-4" />
                <span>System Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

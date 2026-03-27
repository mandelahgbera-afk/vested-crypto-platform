import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Page } from '@/App';
import type { User, Crypto, Trader, Transaction, AdminSetting } from '@/types';
import { mockApi, getDashboardStats } from '@/lib/mockData';
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
  
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalTransactions: 0,
    pendingRequests: 0,
    activeTraders: 0,
    listedCryptos: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, cryptosData, tradersData, transactionsData, settingsData] = await Promise.all([
        mockApi.getUsers(),
        mockApi.getCryptos(),
        mockApi.getTraders(),
        mockApi.getTransactions(),
        mockApi.getSettings(),
      ]);

      setUsers(usersData);
      setCryptos(cryptosData);
      setTraders(tradersData);
      setTransactions(transactionsData);
      setSettings(settingsData);
      setStats(getDashboardStats());
    } catch (error) {
      showToast('Failed to load admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await mockApi.updateUser(userId, updates);
      showToast('User updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update user', 'error');
    }
  };

  const handleUpdateCrypto = async (cryptoId: string, updates: Partial<Crypto>) => {
    try {
      await mockApi.updateCrypto(cryptoId, updates);
      showToast('Cryptocurrency updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update cryptocurrency', 'error');
    }
  };

  const handleAddCrypto = async (crypto: Omit<Crypto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await mockApi.addCrypto(crypto);
      showToast('Cryptocurrency added successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to add cryptocurrency', 'error');
    }
  };

  const handleUpdateTrader = async (traderId: string, updates: Partial<Trader>) => {
    try {
      await mockApi.updateTrader(traderId, updates);
      showToast('Trader updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update trader', 'error');
    }
  };

  const handleAddTrader = async (trader: Omit<Trader, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await mockApi.addTrader(trader);
      showToast('Trader added successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to add trader', 'error');
    }
  };

  const handleUpdateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    try {
      await mockApi.updateTransaction(transactionId, updates);
      showToast('Transaction updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update transaction', 'error');
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await mockApi.updateSetting(key, value);
      showToast('Setting updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to update setting', 'error');
    }
  };

  const handleLogout = () => {
    adminLogout();
    onNavigate('landing');
    showToast('Logged out successfully', 'info');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-[#6941C6] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <AdminOverview stats={stats} recentTransactions={transactions.slice(0, 5)} />;
      case 'users':
        return <AdminUsers users={users} onUpdate={handleUpdateUser} />;
      case 'cryptos':
        return <AdminCryptos cryptos={cryptos} onUpdate={handleUpdateCrypto} onAdd={handleAddCrypto} />;
      case 'traders':
        return <AdminTraders traders={traders} onUpdate={handleUpdateTrader} onAdd={handleAddTrader} />;
      case 'transactions':
        return <AdminTransactions transactions={transactions} onUpdate={handleUpdateTransaction} />;
      case 'settings':
        return <AdminSettings settings={settings} onUpdate={handleUpdateSetting} />;
      default:
        return <AdminOverview stats={stats} recentTransactions={transactions.slice(0, 5)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0C111D] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#070B13] border-r border-white/5 flex flex-col fixed top-0 left-0 bottom-0 z-50">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold">Vested</span>
              <span className="block text-xs text-[#6941C6]">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
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

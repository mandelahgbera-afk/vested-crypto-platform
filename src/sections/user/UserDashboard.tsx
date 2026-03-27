import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Page } from '@/App';
import type { Crypto, Trader, Transaction } from '@/types';
import { getCryptos, getTraders, createTransaction, followTrader, unfollowTrader } from '@/lib/supabase';
import { useTransactions, useActivity, usePortfolio, useFollowedTraders } from '@/hooks/useUserData';
import UserSidebar from './UserSidebar';
import PortfolioView from './PortfolioView';
import MarketView from './MarketView';
import DepositView from './DepositView';
import WithdrawView from './WithdrawView';
import CopytradersView from './CopytradersView';
import ProfileView from './ProfileView';
import TransactionsView from './TransactionsView';
import MobileNav from './MobileNav';
import { Bell, Wallet, Sparkles } from 'lucide-react';

interface UserDashboardProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function UserDashboard({ currentPage, onNavigate }: UserDashboardProps) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  // Use custom hooks for data fetching
  const { transactions, isLoading: txLoading, refetch: refetchTransactions } = useTransactions();
  const { activities, isLoading: actLoading } = useActivity();
  const { chartData, isLoading: portLoading } = usePortfolio();
  const { followedTraders: userTradersData, refetch: refetchTraders } = useFollowedTraders();
  
  // State for static data
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [userTradersSet, setUserTradersSet] = useState<Set<string>>(new Set());
  
  const isLoading = txLoading || actLoading || portLoading;

  // Load crypto and trader data on mount
  useEffect(() => {
    loadStaticData();
  }, []);

  // Update user traders set when data loads
  useEffect(() => {
    setUserTradersSet(new Set(userTradersData.map((ut: { trader_id: string }) => ut.trader_id)));
  }, [userTradersData]);

  const loadStaticData = async () => {
    try {
      const [cryptosData, tradersData] = await Promise.all([
        getCryptos(),
        getTraders(),
      ]);
      setCryptos(cryptosData);
      setTraders(tradersData);
    } catch (error) {
      console.error('[UserDashboard] Failed to load static data:', error);
      showToast('Failed to load crypto and trader data', 'error');
    }
  };

  const handleFollowTrader = async (traderId: string) => {
    if (!user) return;
    
    try {
      if (userTradersSet.has(traderId)) {
        await unfollowTrader(user.id, traderId);
        setUserTradersSet(prev => {
          const newSet = new Set(prev);
          newSet.delete(traderId);
          return newSet;
        });
        showToast('Unfollowed trader', 'info');
      } else {
        await followTrader(user.id, traderId);
        setUserTradersSet(prev => new Set([...prev, traderId]));
        showToast('Now following trader', 'success');
      }
      await refetchTraders();
    } catch (error) {
      console.error('[UserDashboard] Follow error:', error);
      showToast('Failed to update follow status', 'error');
    }
  };

  const handleCreateTransaction = async (type: 'deposit' | 'withdrawal', data: Partial<Transaction>) => {
    if (!user) return;
    
    try {
      await createTransaction({
        user_id: user.id,
        type,
        amount: data.amount || 0,
        crypto_symbol: data.crypto_symbol,
        address: data.address,
        notes: data.notes,
      });
      
      // Refresh transactions
      await refetchTransactions();
      
      showToast(`${type === 'deposit' ? 'Deposit' : 'Withdrawal'} request submitted!`, 'success');
    } catch (error) {
      console.error('[UserDashboard] Transaction error:', error);
      showToast('Failed to create request', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
    showToast('Logged out successfully', 'info');
  };

  // Render the appropriate view based on current page
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-[#6941C6] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <PortfolioView
            user={user}
            cryptos={cryptos}
            chartData={chartData}
            activities={activities}
            onNavigate={onNavigate}
          />
        );
      case 'market':
        return (
          <MarketView
            cryptos={cryptos}
          />
        );
      case 'deposit':
        return (
          <DepositView
            cryptos={cryptos}
            onSubmit={(data) => handleCreateTransaction('deposit', data)}
          />
        );
      case 'withdraw':
        return (
          <WithdrawView
            user={user}
            cryptos={cryptos}
            onSubmit={(data) => handleCreateTransaction('withdrawal', data)}
          />
        );
      case 'copytraders':
        return (
          <CopytradersView
            traders={traders}
            userTraders={Array.from(userTradersSet)}
            onFollow={handleFollowTrader}
          />
        );
      case 'profile':
        return (
          <ProfileView
            user={user}
            onUpdate={loadStaticData}
          />
        );
      case 'transactions':
        return (
          <TransactionsView
            transactions={transactions}
          />
        );
      default:
        return (
          <PortfolioView
            user={user}
            cryptos={cryptos}
            chartData={chartData}
            activities={activities}
            onNavigate={onNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0C111D] flex">
      {/* Desktop Sidebar */}
      <UserSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
        {/* Mobile App Header */}
        <header className="sticky top-0 z-50 lg:bg-[#0C111D]/80 lg:backdrop-blur-xl lg:border-b lg:border-white/5">
          {/* Mobile Header */}
          <div className="lg:hidden">
            {/* Top Bar with Gradient */}
            <div className="relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#6938ef]/10 via-transparent to-[#d534d8]/10" />
              
              <div className="relative flex items-center justify-between px-4 py-3">
                {/* User Greeting */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6938ef] to-[#d534d8] p-[2px]">
                      <div className="w-full h-full rounded-full bg-[#161b26] flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    {/* Online Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#17B26A] rounded-full border-2 border-[#0C111D]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#667085]">Welcome back</p>
                    <p className="text-sm font-semibold text-white flex items-center gap-1">
                      {user?.full_name?.split(' ')[0] || 'User'}
                      <Sparkles className="w-3 h-3 text-[#d534d8]" />
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Wallet Quick View */}
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center gap-2 px-3 py-2 bg-[#161b26] border border-white/10 rounded-full"
                  >
                    <Wallet className="w-4 h-4 text-[#6938ef]" />
                    <span className="text-sm font-medium text-white">
                      ${user?.balance?.toLocaleString() || '0'}
                    </span>
                  </button>
                  
                  {/* Notifications */}
                  <button 
                    onClick={() => showToast('No new notifications', 'info')}
                    className="relative w-10 h-10 bg-[#161b26] border border-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Bell className="w-5 h-5 text-[#A5ACBA]" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#F04438] rounded-full animate-pulse" />
                  </button>
                </div>
              </div>
            </div>

            {/* Page Title Bar */}
            <div className="px-4 pb-3 pt-1">
              <h1 className="text-xl font-bold capitalize">
                <span className="gradient-text">
                  {currentPage === 'dashboard' ? 'Portfolio' : currentPage}
                </span>
              </h1>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold capitalize">
                {currentPage === 'dashboard' ? 'Portfolio' : currentPage}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => showToast('No new notifications', 'info')}
                className="relative w-10 h-10 bg-[#161b26] border border-white/10 rounded-lg flex items-center justify-center hover:bg-[#1F242F] transition-colors"
              >
                <Bell className="w-5 h-5 text-[#A5ACBA]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#F04438] rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 pb-28 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Pull to refresh indicator (visual only) */}
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-12 h-1 bg-white/10 rounded-full" />
            </div>
            
            {/* Main Content with Animation */}
            <div className="animate-in">
              {renderView()}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={onNavigate}
      />
    </div>
  );
}

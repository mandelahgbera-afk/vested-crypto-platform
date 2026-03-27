import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserById,
  getTransactionsByUserId,
  getUserHoldings,
  getUserChartData,
  getActivityLogs,
  getUserFollowedTraders,
} from '@/lib/supabase';
import type {
  User,
  Transaction,
  UserCrypto,
  UserChartData,
  ActivityItem,
  UserTrader,
} from '@/types';

// ============================================
// TRANSACTION DATA HOOK
// ============================================

interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useTransactions(): UseTransactionsReturn {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactionsByUserId(user.id);
      setTransactions(data);
    } catch (err) {
      console.error('[useTransactions] Error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}

// ============================================
// PORTFOLIO DATA HOOK
// ============================================

interface UsePortfolioReturn {
  holdings: UserCrypto[];
  chartData: UserChartData[];
  totalValue: number;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<UserCrypto[]>([]);
  const [chartData, setChartData] = useState<UserChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchPortfolioData = useCallback(async () => {
    if (!user) {
      setHoldings([]);
      setChartData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [holdingsData, chartDataResult] = await Promise.all([
        getUserHoldings(user.id),
        getUserChartData(user.id),
      ]);

      setHoldings(holdingsData);
      setChartData(chartDataResult);
    } catch (err) {
      console.error('[usePortfolio] Error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Calculate total value from holdings
  const totalValue = holdings.reduce((sum, holding) => {
    if (holding.crypto) {
      return sum + holding.balance * holding.crypto.price;
    }
    return sum;
  }, 0);

  return {
    holdings,
    chartData,
    totalValue,
    isLoading,
    error,
    refetch: fetchPortfolioData,
  };
}

// ============================================
// ACTIVITY LOG HOOK
// ============================================

interface UseActivityReturn {
  activities: ActivityItem[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useActivity(): UseActivityReturn {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchActivity = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getActivityLogs(user.id);
      setActivities(data);
    } catch (err) {
      console.error('[useActivity] Error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivity,
  };
}

// ============================================
// FOLLOWED TRADERS HOOK
// ============================================

interface UseFollowedTradersReturn {
  traders: UserTrader[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useFollowedTraders(): UseFollowedTradersReturn {
  const { user } = useAuth();
  const [traders, setTraders] = useState<UserTrader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchTraders = useCallback(async () => {
    if (!user) {
      setTraders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserFollowedTraders(user.id);
      setTraders(data);
    } catch (err) {
      console.error('[useFollowedTraders] Error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

  return {
    traders,
    isLoading,
    error,
    refetch: fetchTraders,
  };
}

// ============================================
// USER PROFILE HOOK
// ============================================

interface UseUserProfileReturn {
  profile: User | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user: contextUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(contextUser || null);
  const [isLoading, setIsLoading] = useState(!contextUser);
  const [error, setError] = useState<unknown>(null);

  const fetchProfile = useCallback(async () => {
    if (!contextUser) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserById(contextUser.id);
      setProfile(data);
    } catch (err) {
      console.error('[useUserProfile] Error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [contextUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

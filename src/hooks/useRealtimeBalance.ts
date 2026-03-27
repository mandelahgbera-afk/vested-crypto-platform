import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook to subscribe to real-time balance updates for a user
 */
export function useRealtimeBalance(userId: string | null) {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let subscription: any;

    const setupSubscription = async () => {
      try {
        // First, fetch current balance
        const { data: user, error } = await supabase
          .from('users')
          .select('balance')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching initial balance:', error);
          setIsLoading(false);
          return;
        }

        setBalance(user?.balance || 0);
        setIsLoading(false);

        // Subscribe to real-time updates
        subscription = supabase
          .channel(`user_balance_${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${userId}`,
            },
            (payload: any) => {
              if (payload.new?.balance) {
                setBalance(payload.new.balance);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up balance subscription:', error);
        setIsLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  return { balance, isLoading };
}

/**
 * Hook to subscribe to real-time crypto holdings updates
 */
export function useRealtimeCryptoHoldings(userId: string | null) {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let subscription: any;

    const setupSubscription = async () => {
      try {
        // Fetch initial holdings
        const { data: userHoldings, error } = await supabase
          .from('user_cryptos')
          .select('*, crypto:cryptos(*)')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching initial holdings:', error);
          setIsLoading(false);
          return;
        }

        setHoldings(userHoldings || []);
        setIsLoading(false);

        // Subscribe to real-time updates on user_cryptos table
        subscription = supabase
          .channel(`user_holdings_${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_cryptos',
              filter: `user_id=eq.${userId}`,
            },
            (payload: any) => {
              if (payload.eventType === 'DELETE') {
                setHoldings((prev) => prev.filter((h) => h.id !== payload.old.id));
              } else if (payload.eventType === 'INSERT') {
                setHoldings((prev) => [...prev, payload.new]);
              } else if (payload.eventType === 'UPDATE') {
                setHoldings((prev) =>
                  prev.map((h) => (h.id === payload.new.id ? payload.new : h))
                );
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up holdings subscription:', error);
        setIsLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  return { holdings, isLoading };
}

/**
 * Hook to subscribe to real-time transaction updates
 */
export function useRealtimeTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    let subscription: any;

    const setupSubscription = async () => {
      try {
        // Fetch initial transactions
        const { data: userTransactions, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching initial transactions:', error);
          setIsLoading(false);
          return;
        }

        setTransactions(userTransactions || []);
        setIsLoading(false);

        // Subscribe to real-time updates
        subscription = supabase
          .channel(`user_transactions_${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'transactions',
              filter: `user_id=eq.${userId}`,
            },
            (payload: any) => {
              if (payload.eventType === 'INSERT') {
                setTransactions((prev) => [payload.new, ...prev].slice(0, 50));
              } else if (payload.eventType === 'UPDATE') {
                setTransactions((prev) =>
                  prev.map((t) => (t.id === payload.new.id ? payload.new : t))
                );
              } else if (payload.eventType === 'DELETE') {
                setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up transactions subscription:', error);
        setIsLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  return { transactions, isLoading };
}

/**
 * Hook to subscribe to real-time crypto price updates
 */
export function useRealtimeCryptoPrices() {
  const [cryptos, setCryptos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    const setupSubscription = async () => {
      try {
        // Fetch initial cryptos
        const { data: cryptoList, error } = await supabase.from('cryptos').select('*');

        if (error) {
          console.error('Error fetching initial cryptos:', error);
          setIsLoading(false);
          return;
        }

        setCryptos(cryptoList || []);
        setIsLoading(false);

        // Subscribe to real-time updates on cryptos table
        subscription = supabase
          .channel('cryptos_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cryptos',
            },
            (payload: any) => {
              if (payload.eventType === 'DELETE') {
                setCryptos((prev) => prev.filter((c) => c.id !== payload.old.id));
              } else if (payload.eventType === 'INSERT') {
                setCryptos((prev) => [...prev, payload.new]);
              } else if (payload.eventType === 'UPDATE') {
                setCryptos((prev) =>
                  prev.map((c) => (c.id === payload.new.id ? payload.new : c))
                );
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up crypto prices subscription:', error);
        setIsLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { cryptos, isLoading };
}

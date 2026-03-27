import { useState, useEffect } from 'react';
import type { Crypto, User } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { getUserHoldings } from '@/lib/supabase';

interface WithdrawViewProps {
  user: User | null;
  cryptos: Crypto[];
  onSubmit: (data: { amount: number; crypto_symbol: string; address: string }) => void;
}

// Fallback mock balances (only used if no real data)
const mockBalances: Record<string, number> = {
  BTC: 0.5,
  ETH: 5.2,
  LTC: 50,
  BCH: 10,
  ADA: 10000,
  XLM: 25000,
};

// Network fees
const networkFees: Record<string, number> = {
  BTC: 0.0005,
  ETH: 0.005,
  LTC: 0.001,
  BCH: 0.001,
  ADA: 1,
  XLM: 0.01,
};

// Withdrawal address validators for different cryptocurrencies
const addressValidators: Record<string, RegExp> = {
  BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  ETH: /^0x[a-fA-F0-9]{40}$/,
  LTC: /^[LM3][a-zA-km-zA-HJ-NP-Z1-9]{26,33}$/,
  BCH: /^(bitcoincash:)?[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  ADA: /^addr1[a-z0-9]{58}$/,
  XLM: /^G[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]{55}$/,
};

export default function WithdrawView({ user, cryptos, onSubmit }: WithdrawViewProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto>(cryptos[0] || { symbol: 'BTC' } as Crypto);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const { showToast } = useToast();

  const validateAddress = (addr: string, symbol: string): boolean => {
    if (!addr.trim()) {
      setAddressError('Address is required');
      return false;
    }

    const validator = addressValidators[symbol];
    if (validator && !validator.test(addr)) {
      setAddressError(`Invalid ${symbol} address format`);
      return false;
    }

    setAddressError(null);
    return true;
  };

  // Fetch real user holdings
  useEffect(() => {
    const fetchUserBalances = async () => {
      if (!user?.id) {
        setUserBalances(mockBalances);
        setIsLoadingBalances(false);
        return;
      }

      try {
        const holdings = await getUserHoldings(user.id);
        const balances: Record<string, number> = {};
        
        holdings.forEach((holding) => {
          if (holding.crypto?.symbol) {
            balances[holding.crypto.symbol] = holding.balance || 0;
          }
        });

        // Merge with mock data if some cryptos are missing
        const merged = { ...mockBalances, ...balances };
        setUserBalances(merged);
      } catch (error) {
        console.error('Failed to fetch user balances:', error);
        setUserBalances(mockBalances);
      } finally {
        setIsLoadingBalances(false);
      }
    };

    fetchUserBalances();
  }, [user?.id]);

  const balance = userBalances[selectedCrypto.symbol || 'BTC'] || 0;
  const fee = networkFees[selectedCrypto.symbol || 'BTC'] || 0;
  const usdValue = (parseFloat(amount) || 0) * (selectedCrypto.price || 0);

  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    setReceiveAmount(Math.max(0, amt - fee));
  }, [amount, fee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    
    if (amt > balance) {
      showToast('Insufficient balance', 'error');
      return;
    }
    
    if (!validateAddress(address, selectedCrypto.symbol || 'BTC')) {
      return;
    }
    
    onSubmit({
      amount: amt,
      crypto_symbol: selectedCrypto.symbol || 'BTC',
      address: address.trim(),
    });
    setAmount('');
    setAddress('');
    setAddressError(null);
  };

  const handleMax = () => {
    setAmount(balance.toString());
  };

  const getCryptoIconClass = (symbol: string) => {
    const map: Record<string, string> = {
      BTC: 'crypto-icon-btc',
      ETH: 'crypto-icon-eth',
      LTC: 'crypto-icon-ltc',
      ADA: 'crypto-icon-ada',
      BCH: 'crypto-icon-bch',
      XLM: 'crypto-icon-xlm',
    };
    return map[symbol] || 'crypto-icon-btc';
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Crypto Selector */}
      <div className="glass-card p-6">
        <p className="text-sm text-[#A5ACBA] mb-4">Select Cryptocurrency</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {cryptos.slice(0, 6).map((crypto) => (
            <button
              key={crypto.id}
              onClick={() => {
                setSelectedCrypto(crypto);
                setAmount('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCrypto.id === crypto.id
                  ? 'bg-[#6941C6] text-white'
                  : 'bg-[#161b26] text-[#A5ACBA] hover:text-white'
              }`}
            >
              <div className={`w-6 h-6 ${getCryptoIconClass(crypto.symbol)} rounded-full flex items-center justify-center text-[10px] font-bold`}>
                {crypto.symbol[0]}
              </div>
              <span className="text-sm font-medium">{crypto.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-6">
        {isLoadingBalances ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-[#A5ACBA]">Loading balance...</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${getCryptoIconClass(selectedCrypto.symbol || 'BTC')} rounded-xl flex items-center justify-center text-lg font-bold`}>
                {selectedCrypto.symbol?.[0] || 'B'}
              </div>
              <div>
                <p className="text-sm text-[#A5ACBA]">Available Balance</p>
                <p className="text-xl font-bold">{balance} {selectedCrypto.symbol || 'BTC'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#A5ACBA]">≈ USD</p>
              <p className="font-medium">${(balance * (selectedCrypto.price || 0)).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Form */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Withdrawal Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-dark pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMax}
                  className="px-2 py-1 bg-[#161b26] text-[10px] font-medium rounded hover:bg-[#1F242F] transition-colors"
                >
                  MAX
                </button>
                <span className="text-sm text-[#A5ACBA]">{selectedCrypto.symbol || 'BTC'}</span>
              </div>
            </div>
            {usdValue > 0 && (
              <p className="text-xs text-[#667085] mt-1">≈ ${usdValue.toLocaleString()}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Withdrawal Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (e.target.value.trim()) {
                  validateAddress(e.target.value, selectedCrypto.symbol || 'BTC');
                }
              }}
              placeholder={`Enter ${selectedCrypto.symbol || 'BTC'} address`}
              className={`input-dark ${addressError ? 'border-[#F04438]' : ''}`}
            />
            {addressError ? (
              <p className="text-xs text-[#F04438] mt-1 font-medium">{addressError}</p>
            ) : (
              <p className="text-xs text-[#667085] mt-1">
                Double-check your address. Transactions cannot be reversed.
              </p>
            )}
          </div>

          {/* Fee Summary */}
          <div className="p-4 bg-[#070B13] rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#A5ACBA]">Network Fee</span>
              <span>{fee} {selectedCrypto.symbol || 'BTC'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A5ACBA]">You'll receive</span>
              <span className="font-medium">{receiveAmount.toFixed(6)} {selectedCrypto.symbol || 'BTC'}</span>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            Withdraw {selectedCrypto.symbol || 'BTC'}
          </button>
        </form>
      </div>

      {/* Warning */}
      <div className="p-4 bg-[#F04438]/10 border border-[#F04438]/20 rounded-lg">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F04438] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F04438] mb-1">Important</p>
            <p className="text-sm text-[#A5ACBA]">
              Please ensure the withdrawal address is correct and supports the selected cryptocurrency. 
              Sending to an incorrect address may result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

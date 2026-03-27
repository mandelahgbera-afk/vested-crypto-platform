import { useState } from 'react';
import type { Crypto } from '@/types';
import { Copy, Check, Info } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface DepositViewProps {
  cryptos: Crypto[];
  onSubmit: (data: { amount: number; crypto_symbol: string; address: string }) => void;
}

// Mock deposit addresses
const depositAddresses: Record<string, string> = {
  BTC: 'bc1q2wrnatsqn06mtyycfkaqju6esagj9qf9ahnteh',
  ETH: '0x573A5372003e44Eb2E0F02DC5E31442a551b4904',
  LTC: 'ltc1quyc8m29nwe0rrxr94d0t9968fdaevn0fzw94wd',
  BCH: 'qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
  ADA: 'addr1qyqzs453y6un84h2glkmuu3q2vn3yjwu7fkqu9frcd7c2qzkhehsgedk746cxtdkzx03mpg9ap278rx9mdlwwvcyters0urqkg',
  XLM: 'GAZEHCGK43MZYAQKWDFQTC6OIZHSK6CWQQVXABCRSBQHMEMLKEDSQLIT',
};

export default function DepositView({ cryptos, onSubmit }: DepositViewProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto>(cryptos[0] || { symbol: 'BTC' } as Crypto);
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddresses[selectedCrypto.symbol] || '');
    setCopied(true);
    showToast('Address copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    onSubmit({
      amount: parseFloat(amount),
      crypto_symbol: selectedCrypto.symbol,
      address: depositAddresses[selectedCrypto.symbol] || '',
    });
    setAmount('');
    setTxId('');
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
              onClick={() => setSelectedCrypto(crypto)}
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

      {/* Deposit Address */}
      <div className="glass-card p-6 text-center">
        <div className={`w-16 h-16 ${getCryptoIconClass(selectedCrypto.symbol)} rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4`}>
          {selectedCrypto.symbol?.[0] || 'B'}
        </div>
        <h3 className="text-xl font-semibold mb-2">{selectedCrypto.name || 'Bitcoin'} Deposit</h3>
        <p className="text-sm text-[#A5ACBA] mb-6">Send {selectedCrypto.symbol || 'BTC'} to the address below</p>

        {/* QR Code Placeholder */}
        <div className="w-44 h-44 mx-auto mb-6 bg-white rounded-xl p-4">
          <div className="w-full h-full bg-[#0C111D] rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${
                    [0, 1, 3, 4, 5, 7, 9, 10, 12, 15, 17, 19, 20, 21, 23].includes(i)
                      ? 'bg-white'
                      : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="relative">
          <div className="p-4 bg-[#070B13] border border-white/10 rounded-lg font-mono text-xs text-[#A5ACBA] break-all pr-12">
            {depositAddresses[selectedCrypto.symbol || 'BTC']}
          </div>
          <button
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#161b26] rounded-lg hover:bg-[#1F242F] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#17B26A]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Verification Form */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Verify Deposit</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Amount</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Amount in ${selectedCrypto.symbol || 'BTC'}`}
              className="input-dark"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A5ACBA] mb-2">Transaction ID (optional)</label>
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Enter transaction hash"
              className="input-dark"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Verify Deposit
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="p-4 bg-[#6941C6]/10 border border-[#6941C6]/20 rounded-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-[#6941C6] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#A5ACBA]">
            <span className="text-[#6941C6] font-medium">Note:</span> Deposits typically confirm within 10-30 minutes depending on network congestion. Please ensure you're sending to the correct address.
          </p>
        </div>
      </div>
    </div>
  );
}

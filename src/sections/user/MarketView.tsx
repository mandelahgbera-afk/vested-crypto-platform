import { useState } from 'react';
import type { Crypto } from '@/types';
import { Search, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketViewProps {
  cryptos: Crypto[];
}

const tabs = ['All', 'Favorites', 'Gainers', 'Losers'];

export default function MarketView({ cryptos }: MarketViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredCryptos = cryptos.filter(crypto => {
    const matchesSearch = 
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'Favorites') {
      return matchesSearch && favorites.includes(crypto.id);
    }
    if (activeTab === 'Gainers') {
      return matchesSearch && crypto.change_24h > 0;
    }
    if (activeTab === 'Losers') {
      return matchesSearch && crypto.change_24h < 0;
    }
    return matchesSearch;
  });

  const getCryptoIconClass = (symbol: string) => {
    const map: Record<string, string> = {
      BTC: 'crypto-icon-btc',
      ETH: 'crypto-icon-eth',
      LTC: 'crypto-icon-ltc',
      ADA: 'crypto-icon-ada',
      BCH: 'crypto-icon-bch',
      XLM: 'crypto-icon-xlm',
      SOL: 'crypto-icon-sol',
      BNB: 'crypto-icon-bnb',
      XRP: 'crypto-icon-xrp',
    };
    return map[symbol] || 'crypto-icon-btc';
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  // Market stats
  const marketStats = [
    { label: 'Global Market Cap', value: '$2.4T', change: '+2.4%', positive: true },
    { label: '24h Volume', value: '$98.2B', change: '+5.1%', positive: true },
    { label: 'BTC Dominance', value: '52.4%', change: '-0.2%', positive: false },
    { label: 'Fear & Greed', value: '72', change: 'Greed', positive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search coins..."
          className="input-dark pl-12"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-[#6941C6] text-white'
                : 'bg-[#161b26] text-[#A5ACBA] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {marketStats.map((stat, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#A5ACBA]">{stat.label}</span>
              <span className={`text-xs ${stat.positive ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Coins List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Cryptocurrencies</h3>
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredCryptos.map((crypto) => (
              <div key={crypto.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                <button
                  onClick={() => toggleFavorite(crypto.id)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    favorites.includes(crypto.id) ? 'text-[#F59E0B]' : 'text-[#667085] hover:text-[#F59E0B]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${favorites.includes(crypto.id) ? 'fill-current' : ''}`} />
                </button>
                
                <div className={`w-10 h-10 ${getCryptoIconClass(crypto.symbol)} rounded-lg flex items-center justify-center text-sm font-bold`}>
                  {crypto.symbol[0]}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{crypto.symbol}</p>
                  <p className="text-xs text-[#A5ACBA]">{crypto.name}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">${crypto.price.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 text-sm ${crypto.change_24h >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                    {crypto.change_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h}%</span>
                  </div>
                </div>
                
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-[#A5ACBA]">{formatCurrency(crypto.market_cap)}</p>
                  <p className="text-xs text-[#667085]">Market Cap</p>
                </div>
                
                <div className="hidden md:block text-right">
                  <p className="text-sm text-[#A5ACBA]">{formatCurrency(crypto.volume_24h)}</p>
                  <p className="text-xs text-[#667085]">Volume (24h)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

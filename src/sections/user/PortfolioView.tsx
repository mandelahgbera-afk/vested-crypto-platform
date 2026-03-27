import { useState } from 'react';
import type { User, Crypto, ActivityItem } from '@/types';
import type { Page } from '@/App';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface PortfolioViewProps {
  user: User | null;
  cryptos: Crypto[];
  chartData: { date: string; value: number }[];
  activities: ActivityItem[];
  onNavigate: (page: Page) => void;
}

const timeframes = ['1D', '1W', '1M', '1Y', 'ALL'];

export default function PortfolioView({ user, cryptos, chartData, activities, onNavigate }: PortfolioViewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1W');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'receive':
        return <ArrowDownCircle className="w-5 h-5 text-[#17B26A]" />;
      case 'send':
        return <ArrowUpCircle className="w-5 h-5 text-[#F04438]" />;
      case 'stake':
        return <TrendingUp className="w-5 h-5 text-[#6941C6]" />;
      case 'unstake':
        return <TrendingDown className="w-5 h-5 text-[#F79009]" />;
      default:
        return <Wallet className="w-5 h-5 text-[#A5ACBA]" />;
    }
  };

  const getActivityBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'receive':
        return 'bg-[#17B26A]/20';
      case 'send':
        return 'bg-[#F04438]/20';
      case 'stake':
        return 'bg-[#6941C6]/20';
      case 'unstake':
        return 'bg-[#F79009]/20';
      default:
        return 'bg-[#161b26]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card - Mobile Optimized */}
      <div className="mobile-card lg:glass-card lg:p-6 relative overflow-hidden">
        {/* Web3 Glow Effect */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        
        {/* Mobile: Quick Stats Row */}
        <div className="lg:hidden flex gap-3 mb-4 overflow-x-auto no-scrollbar pb-2">
          <div className="flex-shrink-0 px-4 py-2 bg-[#17B26A]/10 border border-[#17B26A]/20 rounded-xl">
            <p className="text-[10px] text-[#667085] uppercase">Profit</p>
            <p className="text-sm font-semibold text-[#17B26A]">+{((user?.profit_loss || 0) / (user?.balance || 1) * 100).toFixed(1)}%</p>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-[#6941C6]/10 border border-[#6941C6]/20 rounded-xl">
            <p className="text-[10px] text-[#667085] uppercase">Assets</p>
            <p className="text-sm font-semibold text-[#6938ef]">{cryptos.length}</p>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-[#d534d8]/10 border border-[#d534d8]/20 rounded-xl">
            <p className="text-[10px] text-[#667085] uppercase">Staking</p>
            <p className="text-sm font-semibold text-[#d534d8]">Active</p>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-[#667085] mb-1 uppercase tracking-wide">Total Balance</p>
              <h2 className="text-3xl sm:text-4xl font-bold gradient-text">{formatCurrency(user?.balance || 0)}</h2>
              <div className="hidden lg:flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-[#17B26A]" />
                <span className="text-sm text-[#17B26A]">+{(user?.profit_loss || 0) > 0 ? '+' : ''}{((user?.profit_loss || 0) / (user?.balance || 1) * 100).toFixed(1)}%</span>
                <span className="text-sm text-[#667085]">this month</span>
              </div>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex gap-2 flex-wrap">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedTimeframe === tf
                      ? 'bg-[#6941C6] text-white'
                      : 'bg-[#161b26] text-[#A5ACBA] hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6941C6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6941C6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#667085"
                  tick={{ fill: '#667085', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#667085"
                  tick={{ fill: '#667085', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b26',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Balance']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6941C6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('withdraw')}
              className="touch-button flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-[#161b26] border border-white/10 text-white font-medium rounded-xl active:bg-[#1F242F] transition-colors"
            >
              <ArrowUpCircle className="w-5 h-5 text-[#F04438]" />
              <span className="text-sm">Withdraw</span>
            </button>
            <button
              onClick={() => onNavigate('deposit')}
              className="touch-button flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-[#6938ef] to-[#d534d8] text-white font-medium rounded-xl active:opacity-90 transition-opacity glow-purple"
            >
              <ArrowDownCircle className="w-5 h-5" />
              <span className="text-sm">Fund</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assets Grid - Mobile Optimized */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Assets</h3>
          <button 
            onClick={() => onNavigate('market')}
            className="text-sm text-[#6938ef] hover:text-[#d534d8] transition-colors"
          >
            View All →
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {cryptos.slice(0, 6).map((crypto) => (
            <div key={crypto.id} className="mobile-card lg:glass-card lg:hover-lift touch-button">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${getCryptoIconClass(crypto.symbol)} rounded-lg flex items-center justify-center text-sm font-bold`}>
                    {crypto.symbol[0]}
                  </div>
                  <div>
                    <p className="font-medium">{crypto.symbol}</p>
                    <p className="text-xs text-[#A5ACBA]">{crypto.name}</p>
                  </div>
                </div>
                <span className={`text-sm ${crypto.change_24h >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                  {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h}%
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A5ACBA]">Price</span>
                  <span>${crypto.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A5ACBA]">APY</span>
                  <span className="text-[#17B26A]">{crypto.staking_apy}%</span>
                </div>
              </div>
              <button className="w-full mt-3 text-sm py-2.5 bg-[#6941C6]/10 border border-[#6941C6]/30 text-[#6938ef] font-medium rounded-xl active:bg-[#6941C6]/20 transition-colors touch-button">
                Stake {crypto.symbol}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity - Mobile Optimized */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <button 
            onClick={() => onNavigate('transactions')}
            className="text-sm text-[#6938ef] hover:text-[#d534d8] transition-colors"
          >
            See All →
          </button>
        </div>
        <div className="mobile-card lg:glass-card overflow-hidden">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-[#A5ACBA]">
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors active:bg-white/10 touch-button">
                  <div className={`w-10 h-10 ${getActivityBg(activity.type)} rounded-lg flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{activity.type}</p>
                    <p className="text-xs text-[#A5ACBA]">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {activity.amount} {activity.crypto_symbol}
                    </p>
                    <p className="text-xs text-[#A5ACBA]">
                      ${(activity.usd_value ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

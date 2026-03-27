import { useState } from 'react';
import type { Trader } from '@/types';
import { Users, TrendingUp, TrendingDown, UserPlus, UserCheck } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CopytradersViewProps {
  traders: Trader[];
  userTraders: string[];
  onFollow: (traderId: string) => void;
}

export default function CopytradersView({ traders, userTraders, onFollow }: CopytradersViewProps) {
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);

  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Copy Traders</h2>
          <p className="text-[#A5ACBA]">Follow top-performing traders and copy their strategies</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">Total Traders</p>
          <p className="text-2xl font-bold">{traders.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">You're Following</p>
          <p className="text-2xl font-bold text-[#6941C6]">{userTraders.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">Avg. Return</p>
          <p className="text-2xl font-bold text-[#17B26A]">
            +{(traders.reduce((acc, t) => acc + t.profit_loss_percentage, 0) / traders.length).toFixed(0)}%
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">Total Followers</p>
          <p className="text-2xl font-bold">
            {traders.reduce((acc, t) => acc + t.followers_count, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Traders Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {traders.map((trader) => {
          const isFollowing = userTraders.includes(trader.id);
          const isPositive = trader.profit_loss_percentage >= 0;

          return (
            <div key={trader.id} className="glass-card p-5 hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full flex items-center justify-center text-lg font-semibold">
                    {getInitials(trader.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{trader.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#A5ACBA]">
                      <Users className="w-3 h-3" />
                      <span>{trader.followers_count.toLocaleString()} followers</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onFollow(trader.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isFollowing
                      ? 'bg-[#17B26A]/20 text-[#17B26A] hover:bg-[#17B26A]/30'
                      : 'bg-[#6941C6] text-white hover:bg-[#6941C6]/90'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-[#A5ACBA] mb-4 line-clamp-2">{trader.bio}</p>

              {/* Mini Chart */}
              <div className="h-24 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trader.performance_data}>
                    <defs>
                      <linearGradient id={`gradient-${trader.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#17B26A' : '#F04438'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? '#17B26A' : '#F04438'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={isPositive ? '#17B26A' : '#F04438'}
                      strokeWidth={2}
                      fill={`url(#gradient-${trader.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#A5ACBA]">Total Return</p>
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-semibold">{isPositive ? '+' : ''}{trader.profit_loss_percentage}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#A5ACBA]">Profit/Loss</p>
                  <p className={`font-semibold ${trader.total_profit_loss >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                    {trader.total_profit_loss >= 0 ? '+' : ''}{formatCurrency(trader.total_profit_loss)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrader(trader)}
                className="w-full mt-4 py-2 text-sm text-[#6941C6] hover:text-[#6938ef] font-medium"
              >
                View Details
              </button>
            </div>
          );
        })}
      </div>

      {/* Trader Detail Dialog */}
      <Dialog open={!!selectedTrader} onOpenChange={() => setSelectedTrader(null)}>
        <DialogContent className="bg-[#161b26] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Trader Profile</DialogTitle>
          </DialogHeader>
          
          {selectedTrader && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full flex items-center justify-center text-2xl font-semibold">
                  {getInitials(selectedTrader.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedTrader.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#A5ACBA]">
                    <Users className="w-4 h-4" />
                    <span>{selectedTrader.followers_count.toLocaleString()} followers</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-[#A5ACBA]">{selectedTrader.bio}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#070B13] rounded-lg">
                  <p className="text-xs text-[#A5ACBA] mb-1">Total Return</p>
                  <p className={`text-xl font-bold ${selectedTrader.profit_loss_percentage >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                    {selectedTrader.profit_loss_percentage >= 0 ? '+' : ''}{selectedTrader.profit_loss_percentage}%
                  </p>
                </div>
                <div className="p-4 bg-[#070B13] rounded-lg">
                  <p className="text-xs text-[#A5ACBA] mb-1">Profit/Loss</p>
                  <p className={`text-xl font-bold ${selectedTrader.total_profit_loss >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                    {selectedTrader.total_profit_loss >= 0 ? '+' : ''}{formatCurrency(selectedTrader.total_profit_loss)}
                  </p>
                </div>
              </div>

              {/* Performance Chart */}
              <div>
                <p className="text-sm font-medium mb-3">30-Day Performance</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedTrader.performance_data}>
                      <defs>
                        <linearGradient id="detail-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6941C6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6941C6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#667085', fontSize: 10 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        tick={{ fill: '#667085', fontSize: 10 }}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#161b26',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Performance']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6941C6"
                        strokeWidth={2}
                        fill="url(#detail-gradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => {
                  onFollow(selectedTrader.id);
                  setSelectedTrader(null);
                }}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  userTraders.includes(selectedTrader.id)
                    ? 'bg-[#17B26A]/20 text-[#17B26A] hover:bg-[#17B26A]/30'
                    : 'bg-gradient-to-r from-[#6938ef] to-[#d534d8] text-white hover:opacity-90'
                }`}
              >
                {userTraders.includes(selectedTrader.id) ? 'Unfollow Trader' : 'Follow Trader'}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

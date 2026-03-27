import { useMemo } from 'react';
import type { Transaction } from '@/types';
import { 
  Users, DollarSign, Activity, Clock, TrendingUp, TrendingDown,
  ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface AdminOverviewProps {
  stats: {
    totalUsers: number;
    totalBalance: number;
    totalTransactions: number;
    pendingRequests: number;
    activeTraders: number;
    listedCryptos: number;
  };
  recentTransactions: Transaction[];
}

export default function AdminOverview({ stats, recentTransactions }: AdminOverviewProps) {
  // Generate chart data
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        deposits: Math.floor(Math.random() * 50000) + 20000,
        withdrawals: Math.floor(Math.random() * 30000) + 10000,
      });
    }
    return data;
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-[#6941C6]', bg: 'bg-[#6941C6]/20' },
    { label: 'Total Balance', value: `$${stats.totalBalance.toLocaleString()}`, icon: DollarSign, color: 'text-[#17B26A]', bg: 'bg-[#17B26A]/20' },
    { label: 'Transactions', value: stats.totalTransactions, icon: Activity, color: 'text-[#0082f3]', bg: 'bg-[#0082f3]/20' },
    { label: 'Pending', value: stats.pendingRequests, icon: Clock, color: 'text-[#F79009]', bg: 'bg-[#F79009]/20' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <p className="text-sm text-[#A5ACBA] mb-1">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-6">Transaction Volume (7 Days)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#17B26A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#17B26A" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F04438" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F04438" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#667085" tick={{ fill: '#667085', fontSize: 12 }} />
              <YAxis stroke="#667085" tick={{ fill: '#667085', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161b26',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Area
                type="monotone"
                dataKey="deposits"
                name="Deposits"
                stroke="#17B26A"
                strokeWidth={2}
                fill="url(#colorDeposits)"
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                name="Withdrawals"
                stroke="#F04438"
                strokeWidth={2}
                fill="url(#colorWithdrawals)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button className="text-sm text-[#6941C6] hover:text-[#6938ef]">View All</button>
        </div>
        <div className="divide-y divide-white/5">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-[#A5ACBA] py-8">No recent transactions</p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 py-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tx.type === 'deposit' ? 'bg-[#17B26A]/20' : 'bg-[#F04438]/20'
                }`}>
                  {tx.type === 'deposit' ? (
                    <ArrowDownCircle className="w-5 h-5 text-[#17B26A]" />
                  ) : (
                    <ArrowUpCircle className="w-5 h-5 text-[#F04438]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{tx.type}</span>
                    <span className={getStatusBadge(tx.status)}>
                      <span className="capitalize">{tx.status}</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#A5ACBA]">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.crypto_symbol}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#17B26A]/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#17B26A]" />
            </div>
            <div>
              <p className="font-medium">Active Traders</p>
              <p className="text-2xl font-bold">{stats.activeTraders}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#6941C6]/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#6941C6]" />
            </div>
            <div>
              <p className="font-medium">Listed Cryptos</p>
              <p className="text-2xl font-bold">{stats.listedCryptos}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F79009]/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#F79009]" />
            </div>
            <div>
              <p className="font-medium">Pending Requests</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

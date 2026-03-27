import { useState } from 'react';
import type { Trader } from '@/types';
import { Search, Edit2, Plus, Save, X, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AreaChart, Area, ResponsiveContainer 
} from 'recharts';

interface AdminTradersProps {
  traders: Trader[];
  onUpdate: (traderId: string, updates: Partial<Trader>) => void;
  onAdd: (trader: Omit<Trader, 'id' | 'created_at' | 'updated_at'>) => void;
}

export default function AdminTraders({ traders, onUpdate, onAdd }: AdminTradersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    total_profit_loss: 0,
    profit_loss_percentage: 0,
    followers_count: 0,
    is_active: true,
    performance_data: [] as { date: string; value: number }[],
  });

  const filteredTraders = traders.filter(trader =>
    trader.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (trader: Trader) => {
    setSelectedTrader(trader);
    setEditForm({
      name: trader.name,
      bio: trader.bio || '',
      total_profit_loss: trader.total_profit_loss,
      profit_loss_percentage: trader.profit_loss_percentage,
      followers_count: trader.followers_count,
      is_active: trader.is_active,
      performance_data: trader.performance_data,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedTrader) return;
    onUpdate(selectedTrader.id, editForm);
    setIsEditing(false);
    setSelectedTrader(null);
  };

  const handleAdd = () => {
    onAdd({
      ...editForm,
      avatar_url: null,
      performance_data: generateDefaultPerformanceData(editForm.profit_loss_percentage),
    });
    setIsAdding(false);
    setEditForm({
      name: '',
      bio: '',
      total_profit_loss: 0,
      profit_loss_percentage: 0,
      followers_count: 0,
      is_active: true,
      performance_data: [],
    });
  };

  const openAddDialog = () => {
    setEditForm({
      name: '',
      bio: '',
      total_profit_loss: 0,
      profit_loss_percentage: 0,
      followers_count: 0,
      is_active: true,
      performance_data: [],
    });
    setIsAdding(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const generateDefaultPerformanceData = (totalReturn: number): { date: string; value: number }[] => {
    const data: { date: string; value: number }[] = [];
    const days = 30;
    let value = 100;
    const dailyReturn = totalReturn / days;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const randomVariation = (Math.random() - 0.5) * 2;
      value = value * (1 + (dailyReturn + randomVariation) / 100);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100,
      });
    }
    
    return data;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search traders..."
              className="input-dark pl-12"
            />
          </div>
          <div className="text-sm text-[#A5ACBA]">
            {filteredTraders.length} traders
          </div>
        </div>
        <button
          onClick={openAddDialog}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Trader
        </button>
      </div>

      {/* Traders Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTraders.map((trader) => {
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
                      <span>{trader.followers_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(trader)}
                  className="p-2 hover:bg-[#161b26] rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-[#6941C6]" />
                </button>
              </div>

              <p className="text-sm text-[#A5ACBA] mb-4 line-clamp-2">{trader.bio}</p>

              {/* Mini Chart */}
              <div className="h-20 mb-4">
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

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <p className="text-xs text-[#A5ACBA]">Return</p>
                  <p className={`font-semibold ${isPositive ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                    {isPositive ? '+' : ''}{trader.profit_loss_percentage}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#A5ACBA]">P&L</p>
                  <p className={`font-semibold ${trader.total_profit_loss >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                    {formatCurrency(trader.total_profit_loss)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#A5ACBA]">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    trader.is_active ? 'bg-[#17B26A]/20 text-[#17B26A]' : 'bg-[#F04438]/20 text-[#F04438]'
                  }`}>
                    {trader.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="bg-[#161b26] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Trader</DialogTitle>
          </DialogHeader>
          
          {selectedTrader && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#070B13] rounded-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full flex items-center justify-center text-xl font-semibold">
                  {getInitials(selectedTrader.name)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedTrader.name}</p>
                  <p className="text-[#A5ACBA]">{selectedTrader.followers_count.toLocaleString()} followers</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="input-dark resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Total P&L ($)</label>
                  <input
                    type="number"
                    value={editForm.total_profit_loss}
                    onChange={(e) => setEditForm({ ...editForm, total_profit_loss: parseFloat(e.target.value) || 0 })}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Return (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.profit_loss_percentage}
                    onChange={(e) => setEditForm({ ...editForm, profit_loss_percentage: parseFloat(e.target.value) || 0 })}
                    className="input-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Followers</label>
                  <input
                    type="number"
                    value={editForm.followers_count}
                    onChange={(e) => setEditForm({ ...editForm, followers_count: parseInt(e.target.value) || 0 })}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Status</label>
                  <select
                    value={editForm.is_active ? 'true' : 'false'}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                    className="input-dark"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex-1"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAdding} onOpenChange={() => setIsAdding(false)}>
        <DialogContent className="bg-[#161b26] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Trader</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A5ACBA] mb-2">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Trader Name"
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A5ACBA] mb-2">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Brief description of trading strategy"
                rows={3}
                className="input-dark resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Total P&L ($)</label>
                <input
                  type="number"
                  value={editForm.total_profit_loss || ''}
                  onChange={(e) => setEditForm({ ...editForm, total_profit_loss: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Return (%)</label>
                <input
                  type="number"
                  step="any"
                  value={editForm.profit_loss_percentage || ''}
                  onChange={(e) => setEditForm({ ...editForm, profit_loss_percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="input-dark"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#A5ACBA] mb-2">Initial Followers</label>
              <input
                type="number"
                value={editForm.followers_count || ''}
                onChange={(e) => setEditForm({ ...editForm, followers_count: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="input-dark"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsAdding(false)}
                className="btn-secondary flex-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="btn-primary flex-1"
              >
                <Plus className="w-4 h-4" />
                Add Trader
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

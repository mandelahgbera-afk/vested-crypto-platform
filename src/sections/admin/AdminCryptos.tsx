import { useState } from 'react';
import type { Crypto } from '@/types';
import { Search, Edit2, Plus, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AdminCryptosProps {
  cryptos: Crypto[];
  onUpdate: (cryptoId: string, updates: Partial<Crypto>) => void;
  onAdd: (crypto: Omit<Crypto, 'id' | 'created_at' | 'updated_at'>) => void;
}

export default function AdminCryptos({ cryptos, onUpdate, onAdd }: AdminCryptosProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    symbol: '',
    price: 0,
    staking_apy: 0,
    change_24h: 0,
    market_cap: 0,
    volume_24h: 0,
    is_active: true,
  });

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (crypto: Crypto) => {
    setSelectedCrypto(crypto);
    setEditForm({
      name: crypto.name,
      symbol: crypto.symbol,
      price: crypto.price,
      staking_apy: crypto.staking_apy,
      change_24h: crypto.change_24h,
      market_cap: crypto.market_cap,
      volume_24h: crypto.volume_24h,
      is_active: crypto.is_active,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedCrypto) return;
    onUpdate(selectedCrypto.id, editForm);
    setIsEditing(false);
    setSelectedCrypto(null);
  };

  const handleAdd = () => {
    onAdd({ ...editForm, icon_url: null });
    setIsAdding(false);
    setEditForm({
      name: '',
      symbol: '',
      price: 0,
      staking_apy: 0,
      change_24h: 0,
      market_cap: 0,
      volume_24h: 0,
      is_active: true,
    });
  };

  const openAddDialog = () => {
    setEditForm({
      name: '',
      symbol: '',
      price: 0,
      staking_apy: 0,
      change_24h: 0,
      market_cap: 0,
      volume_24h: 0,
      is_active: true,
    });
    setIsAdding(true);
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

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
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
              placeholder="Search cryptocurrencies..."
              className="input-dark pl-12"
            />
          </div>
          <div className="text-sm text-[#A5ACBA]">
            {filteredCryptos.length} cryptos
          </div>
        </div>
        <button
          onClick={openAddDialog}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Crypto
        </button>
      </div>

      {/* Cryptos Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCryptos.map((crypto) => (
          <div key={crypto.id} className="glass-card p-5 hover-lift">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${getCryptoIconClass(crypto.symbol)} rounded-xl flex items-center justify-center text-lg font-bold`}>
                  {crypto.symbol[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{crypto.name}</h3>
                  <p className="text-sm text-[#A5ACBA]">{crypto.symbol}</p>
                </div>
              </div>
              <button
                onClick={() => handleEdit(crypto)}
                className="p-2 hover:bg-[#161b26] rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-[#6941C6]" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A5ACBA]">Price</span>
                <span className="font-medium">${crypto.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5ACBA]">24h Change</span>
                <span className={crypto.change_24h >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}>
                  {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5ACBA]">Staking APY</span>
                <span className="text-[#17B26A]">{crypto.staking_apy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5ACBA]">Market Cap</span>
                <span>{formatCurrency(crypto.market_cap)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#A5ACBA]">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  crypto.is_active ? 'bg-[#17B26A]/20 text-[#17B26A]' : 'bg-[#F04438]/20 text-[#F04438]'
                }`}>
                  {crypto.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="bg-[#161b26] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Cryptocurrency</DialogTitle>
          </DialogHeader>
          
          {selectedCrypto && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#070B13] rounded-lg">
                <div className={`w-14 h-14 ${getCryptoIconClass(selectedCrypto.symbol)} rounded-xl flex items-center justify-center text-2xl font-bold`}>
                  {selectedCrypto.symbol[0]}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedCrypto.name}</p>
                  <p className="text-[#A5ACBA]">{selectedCrypto.symbol}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Price (USD)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">24h Change (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.change_24h}
                    onChange={(e) => setEditForm({ ...editForm, change_24h: parseFloat(e.target.value) || 0 })}
                    className="input-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Staking APY (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.staking_apy}
                    onChange={(e) => setEditForm({ ...editForm, staking_apy: parseFloat(e.target.value) || 0 })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Market Cap</label>
                  <input
                    type="number"
                    value={editForm.market_cap}
                    onChange={(e) => setEditForm({ ...editForm, market_cap: parseFloat(e.target.value) || 0 })}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">24h Volume</label>
                  <input
                    type="number"
                    value={editForm.volume_24h}
                    onChange={(e) => setEditForm({ ...editForm, volume_24h: parseFloat(e.target.value) || 0 })}
                    className="input-dark"
                  />
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
            <DialogTitle className="text-xl font-bold">Add Cryptocurrency</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Bitcoin"
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Symbol</label>
                <input
                  type="text"
                  value={editForm.symbol}
                  onChange={(e) => setEditForm({ ...editForm, symbol: e.target.value.toUpperCase() })}
                  placeholder="BTC"
                  className="input-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Price (USD)</label>
                <input
                  type="number"
                  step="any"
                  value={editForm.price || ''}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Staking APY (%)</label>
                <input
                  type="number"
                  step="any"
                  value={editForm.staking_apy || ''}
                  onChange={(e) => setEditForm({ ...editForm, staking_apy: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="input-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">Market Cap</label>
                <input
                  type="number"
                  value={editForm.market_cap || ''}
                  onChange={(e) => setEditForm({ ...editForm, market_cap: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A5ACBA] mb-2">24h Volume</label>
                <input
                  type="number"
                  value={editForm.volume_24h || ''}
                  onChange={(e) => setEditForm({ ...editForm, volume_24h: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="input-dark"
                />
              </div>
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
                Add Cryptocurrency
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

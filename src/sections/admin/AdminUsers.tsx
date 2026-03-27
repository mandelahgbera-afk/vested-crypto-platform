import { useState } from 'react';
import type { User } from '@/types';
import { Search, Edit2, Save, X, DollarSign, TrendingUp, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Toast notifications can be added here if needed

interface AdminUsersProps {
  users: User[];
  onUpdate: (userId: string, updates: Partial<User>) => void;
}

export default function AdminUsers({ users, onUpdate }: AdminUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    balance: 0,
    profit_loss: 0,
    withdrawal_address: '',
    status: 'active' as 'active' | 'suspended',
  });
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      balance: user.balance,
      profit_loss: user.profit_loss,
      withdrawal_address: user.withdrawal_address || '',
      status: user.status,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedUser) return;
    onUpdate(selectedUser.id, editForm);
    setIsEditing(false);
    setSelectedUser(null);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'badge-positive' 
      : 'badge-negative';
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="input-dark pl-12"
          />
        </div>
        <div className="text-sm text-[#A5ACBA]">
          {filteredUsers.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">User</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Balance</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">P&L</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Joined</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full flex items-center justify-center text-sm font-semibold">
                        {getInitials(user.full_name)}
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unnamed'}</p>
                        <p className="text-sm text-[#A5ACBA]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium">${user.balance.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={user.profit_loss >= 0 ? 'text-[#17B26A]' : 'text-[#F04438]'}>
                      {user.profit_loss >= 0 ? '+' : ''}${user.profit_loss.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={getStatusBadge(user.status)}>
                      <span className="capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-[#A5ACBA]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 hover:bg-[#161b26] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-[#6941C6]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="bg-[#161b26] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-[#070B13] rounded-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full flex items-center justify-center text-xl font-semibold">
                  {getInitials(selectedUser.full_name)}
                </div>
                <div>
                  <p className="font-semibold">{selectedUser.full_name || 'Unnamed'}</p>
                  <p className="text-sm text-[#A5ACBA]">{selectedUser.email}</p>
                </div>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Balance (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                    <input
                      type="number"
                      value={editForm.balance}
                      onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })}
                      className="input-dark pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Profit/Loss (USD)</label>
                  <div className="relative">
                    <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                    <input
                      type="number"
                      value={editForm.profit_loss}
                      onChange={(e) => setEditForm({ ...editForm, profit_loss: parseFloat(e.target.value) || 0 })}
                      className="input-dark pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Withdrawal Address</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                    <input
                      type="text"
                      value={editForm.withdrawal_address}
                      onChange={(e) => setEditForm({ ...editForm, withdrawal_address: e.target.value })}
                      className="input-dark pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#A5ACBA] mb-2">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'suspended' })}
                    className="input-dark"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
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
    </div>
  );
}

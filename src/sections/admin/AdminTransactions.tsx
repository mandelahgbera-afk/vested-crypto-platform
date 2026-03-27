import { useState } from 'react';
import type { Transaction } from '@/types';
import { Search, CheckCircle, XCircle, Clock, ArrowDownCircle, ArrowUpCircle, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/contexts/ToastContext';

interface AdminTransactionsProps {
  transactions: Transaction[];
  onUpdate: (transactionId: string, updates: Partial<Transaction>) => void;
}

const filters = ['All', 'Pending', 'Approved', 'Rejected'];
const types = ['All', 'Deposit', 'Withdrawal'];

export default function AdminTransactions({ transactions, onUpdate }: AdminTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const { showToast } = useToast();

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.crypto_symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'All' || tx.type === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleApprove = (tx: Transaction) => {
    onUpdate(tx.id, { status: 'approved' });
    showToast('Transaction approved', 'success');
    setIsViewing(false);
  };

  const handleReject = (tx: Transaction) => {
    onUpdate(tx.id, { status: 'rejected', notes: 'Rejected by admin' });
    showToast('Transaction rejected', 'info');
    setIsViewing(false);
  };

  const handleView = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsViewing(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-[#F79009]" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-[#17B26A]" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-[#F04438]" />;
      default:
        return null;
    }
  };

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

  const getTypeIcon = (type: string) => {
    return type === 'deposit' 
      ? <ArrowDownCircle className="w-5 h-5 text-[#17B26A]" />
      : <ArrowUpCircle className="w-5 h-5 text-[#F04438]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="input-dark pl-12"
            />
          </div>
          <div className="text-sm text-[#A5ACBA]">
            {filteredTransactions.length} transactions
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#A5ACBA]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark py-2 px-3 text-sm"
            >
              {filters.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-dark py-2 px-3 text-sm"
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">Total</p>
          <p className="text-2xl font-bold">{transactions.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">Pending</p>
          <p className="text-2xl font-bold text-[#F79009]">
            {transactions.filter(t => t.status === 'pending').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">Approved</p>
          <p className="text-2xl font-bold text-[#17B26A]">
            {transactions.filter(t => t.status === 'approved').length}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">Total Volume</p>
          <p className="text-2xl font-bold">
            ${transactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Type</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">User</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[#A5ACBA]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(tx.type)}
                      <span className="capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium">{tx.user?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-[#A5ACBA]">{tx.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium">{tx.amount.toLocaleString()} {tx.crypto_symbol}</p>
                    {tx.address && (
                      <p className="text-xs text-[#667085] font-mono truncate max-w-[120px]">
                        {tx.address.slice(0, 6)}...{tx.address.slice(-6)}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={getStatusBadge(tx.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(tx.status)}
                        <span className="capitalize">{tx.status}</span>
                      </span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-[#A5ACBA]">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(tx)}
                        className="text-sm text-[#6941C6] hover:text-[#6938ef]"
                      >
                        View
                      </button>
                      {tx.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(tx)}
                            className="text-sm text-[#17B26A] hover:text-[#17B26A]/80"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(tx)}
                            className="text-sm text-[#F04438] hover:text-[#F04438]/80"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={isViewing} onOpenChange={() => setIsViewing(false)}>
        <DialogContent className="bg-[#161b26] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Transaction Details</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Type & Status */}
              <div className="flex items-center justify-between p-4 bg-[#070B13] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedTransaction.type === 'deposit' ? 'bg-[#17B26A]/20' : 'bg-[#F04438]/20'
                  }`}>
                    {getTypeIcon(selectedTransaction.type)}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{selectedTransaction.type}</p>
                    <p className="text-sm text-[#A5ACBA]">{selectedTransaction.crypto_symbol}</p>
                  </div>
                </div>
                <span className={getStatusBadge(selectedTransaction.status)}>
                  <span className="capitalize">{selectedTransaction.status}</span>
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#A5ACBA]">Amount</span>
                  <span className="font-medium">{selectedTransaction.amount.toLocaleString()} {selectedTransaction.crypto_symbol}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#A5ACBA]">User</span>
                  <span className="font-medium">{selectedTransaction.user?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#A5ACBA]">Email</span>
                  <span className="font-medium">{selectedTransaction.user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-[#A5ACBA]">Date</span>
                  <span className="font-medium">{new Date(selectedTransaction.created_at).toLocaleString()}</span>
                </div>
                {selectedTransaction.address && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-[#A5ACBA]">Address</span>
                    <span className="font-mono text-sm">{selectedTransaction.address}</span>
                  </div>
                )}
                {selectedTransaction.notes && (
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-[#A5ACBA]">Notes</span>
                    <span className="text-sm">{selectedTransaction.notes}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedTransaction.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(selectedTransaction)}
                    className="btn-secondary flex-1 text-[#F04438] border-[#F04438]/30 hover:bg-[#F04438]/10"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedTransaction)}
                    className="btn-primary flex-1 bg-[#17B26A] hover:bg-[#17B26A]/90"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

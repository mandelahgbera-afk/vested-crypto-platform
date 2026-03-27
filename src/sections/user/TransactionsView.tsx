import { useState } from 'react';
import type { Transaction } from '@/types';
import { ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
}

const filters = ['All', 'Pending', 'Approved', 'Rejected'];
const types = ['All', 'Deposit', 'Withdrawal'];

export default function TransactionsView({ transactions }: TransactionsViewProps) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredTransactions = transactions.filter(t => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'All' || t.type === typeFilter.toLowerCase();
    return matchesStatus && matchesType;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <p className="text-[#A5ACBA]">View all your deposits and withdrawals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#A5ACBA]" />
          <span className="text-sm text-[#A5ACBA]">Status:</span>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === filter
                    ? 'bg-[#6941C6] text-white'
                    : 'bg-[#161b26] text-[#A5ACBA] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[#A5ACBA]">Type:</span>
          <div className="flex gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  typeFilter === type
                    ? 'bg-[#6941C6] text-white'
                    : 'bg-[#161b26] text-[#A5ACBA] hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-[#A5ACBA] mb-1">Total Transactions</p>
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

      {/* Transactions List */}
      <div className="glass-card overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-[#A5ACBA]">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  transaction.type === 'deposit' ? 'bg-[#17B26A]/20' : 'bg-[#F04438]/20'
                }`}>
                  {getTypeIcon(transaction.type)}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">{transaction.type}</p>
                    <span className={getStatusBadge(transaction.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(transaction.status)}
                        <span className="capitalize">{transaction.status}</span>
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-[#A5ACBA]">
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                  {transaction.notes && (
                    <p className="text-xs text-[#667085] mt-1">{transaction.notes}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="font-medium">
                    {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} {transaction.crypto_symbol}
                  </p>
                  {transaction.address && (
                    <p className="text-xs text-[#667085] font-mono truncate max-w-[150px]">
                      {transaction.address.slice(0, 8)}...{transaction.address.slice(-8)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

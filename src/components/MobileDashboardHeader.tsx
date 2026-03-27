import { motion } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';
import type { User } from '@/types';

interface MobileDashboardHeaderProps {
  user: User | null;
  balance: number;
  balanceChange: number;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
}

/**
 * Mobile Dashboard Header
 * Displays user greeting, balance with animation, and quick actions
 * Inspired by crypto app UIs like Crypzone and Gem Wallet
 */
export default function MobileDashboardHeader({
  user,
  balance,
  balanceChange,
  onSettingsClick,
  onNotificationsClick,
}: MobileDashboardHeaderProps) {
  const isPositive = balanceChange >= 0;
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-safe px-4 py-6 bg-gradient-to-b from-[#1A1F2E] to-[#0C111D]"
    >
      {/* Top Bar: Profile & Actions */}
      <div className="flex items-center justify-between mb-8">
        {/* Profile Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 flex-1"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full flex items-center justify-center text-sm font-bold">
            {getInitials(user?.full_name || null)}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#A5ACBA]">Welcome back</p>
            <p className="text-base font-semibold truncate">
              {user?.full_name?.split(' ')[0] || 'Guest'}
            </p>
          </div>
        </motion.div>

        {/* Action Icons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationsClick}
            className="p-2.5 bg-[#1A1F2E] hover:bg-[#2A2F3E] rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5 text-[#A5ACBA]" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSettingsClick}
            className="p-2.5 bg-[#1A1F2E] hover:bg-[#2A2F3E] rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-[#A5ACBA]" />
          </motion.button>
        </div>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-[#6938ef]/20 to-[#d534d8]/20 border border-[#6938ef]/30 rounded-2xl p-6 backdrop-blur-sm"
      >
        <p className="text-xs text-[#A5ACBA] font-medium mb-1">Current balance</p>
        
        {/* Balance Amount */}
        <motion.div
          key={balance}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-3"
        >
          <h1 className="text-4xl font-bold text-white">
            ${balance.toFixed(2)}
          </h1>
        </motion.div>

        {/* Change Indicator */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
            isPositive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          <span className="text-lg">{isPositive ? '↑' : '↓'}</span>
          <span>
            {isPositive ? '+' : '−'}
            {Math.abs(balanceChange).toFixed(2)}%
          </span>
          <span className="text-xs">(1d)</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

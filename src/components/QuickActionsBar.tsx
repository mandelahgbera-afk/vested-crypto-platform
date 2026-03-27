import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Send } from 'lucide-react';
import type { Page } from '@/App';

interface QuickActionsBarProps {
  onNavigate: (page: Page) => void;
  onSwap?: () => void;
}

const actions = [
  {
    id: 'deposit',
    label: 'Receive',
    icon: ArrowDownCircle,
    page: 'deposit' as Page,
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  {
    id: 'send',
    label: 'Send',
    icon: Send,
    page: 'withdraw' as Page,
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
  },
  {
    id: 'buy',
    label: 'Buy',
    icon: TrendingUp,
    page: 'market' as Page,
    color: 'from-green-500/20 to-green-600/20',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
  },
  {
    id: 'swap',
    label: 'Swap',
    icon: ArrowUpCircle,
    page: 'market' as Page,
    color: 'from-orange-500/20 to-orange-600/20',
    borderColor: 'border-orange-500/30',
    iconColor: 'text-orange-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

/**
 * Quick Actions Bar
 * Horizontal scrollable card-based actions for mobile-first UI
 * Inspired by crypto wallet apps
 */
export default function QuickActionsBar({ onNavigate, onSwap }: QuickActionsBarProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 py-6"
    >
      <p className="text-xs text-[#A5ACBA] font-semibold mb-3 pl-1">QUICK ACTIONS</p>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isSwap = action.id === 'swap';
          
          return (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isSwap && onSwap) {
                  onSwap();
                } else {
                  onNavigate(action.page);
                }
              }}
              className={`group relative h-24 rounded-xl border transition-all duration-300 overflow-hidden
                ${action.borderColor}
                bg-gradient-to-br ${action.color}
                hover:shadow-lg hover:shadow-[#6938ef]/20
                active:scale-95
              `}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative flex flex-col items-center justify-center h-full px-2">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className={`${action.iconColor} mb-1.5 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <p className="text-xs font-semibold text-white text-center">{action.label}</p>
              </div>

              {/* Ripple effect on hover */}
              <motion.div
                className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-colors"
                layoutId={`ripple-${action.id}`}
              />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

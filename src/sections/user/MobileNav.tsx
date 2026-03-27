import type { Page } from '@/App';
import { 
  PieChart, 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Users, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface MobileNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const mainNavItems = [
  { id: 'dashboard' as Page, label: 'Portfolio', icon: PieChart },
  { id: 'market' as Page, label: 'Market', icon: TrendingUp },
  { id: 'deposit' as Page, label: 'Deposit', icon: ArrowDownCircle },
  { id: 'withdraw' as Page, label: 'Withdraw', icon: ArrowUpCircle },
];

const moreNavItems = [
  { id: 'copytraders' as Page, label: 'Copy Traders', icon: Users },
  { id: 'transactions' as Page, label: 'History', icon: PieChart },
  { id: 'profile' as Page, label: 'Profile', icon: Menu },
];

export default function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* Main Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B13] via-[#070B13]/95 to-transparent" />
        
        {/* Nav Content */}
        <div className="relative bg-[#070B13]/90 backdrop-blur-xl border-t border-white/10">
          <div className="flex justify-around items-center py-2 px-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'text-[#6941C6]' 
                      : 'text-[#667085] hover:text-[#A5ACBA]'
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-[#6938ef] to-[#d534d8] rounded-full" />
                  )}
                  
                  <div className={`p-2 rounded-xl transition-all ${
                    isActive ? 'bg-[#6941C6]/20' : ''
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* More Button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                showMore 
                  ? 'text-[#6941C6]' 
                  : 'text-[#667085] hover:text-[#A5ACBA]'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${
                showMore ? 'bg-[#6941C6]/20' : ''
              }`}>
                {showMore ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </div>
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
          
          {/* Safe Area Padding */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      </nav>

      {/* More Menu Overlay */}
      {showMore && (
        <div 
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setShowMore(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Menu Panel */}
          <div 
            className="absolute bottom-24 left-4 right-4 bg-[#161b26] border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-3">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setShowMore(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#6941C6]/20 text-[#6941C6]' 
                        : 'bg-[#070B13] text-[#A5ACBA] hover:bg-[#1F242F]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

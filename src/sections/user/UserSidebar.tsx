import type { Page } from '@/App';
import type { User } from '@/types';
import { 
  PieChart, TrendingUp, ArrowDownCircle, ArrowUpCircle, Users, 
  Settings, LogOut, History 
} from 'lucide-react';

interface UserSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  user: User | null;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'My Portfolio', icon: PieChart },
  { id: 'market' as Page, label: 'Market', icon: TrendingUp },
  { id: 'deposit' as Page, label: 'Deposit', icon: ArrowDownCircle },
  { id: 'withdraw' as Page, label: 'Withdraw', icon: ArrowUpCircle },
  { id: 'copytraders' as Page, label: 'Copy Traders', icon: Users },
  { id: 'transactions' as Page, label: 'History', icon: History },
  { id: 'profile' as Page, label: 'Profile', icon: Settings },
];

export default function UserSidebar({ currentPage, onNavigate, onLogout, user }: UserSidebarProps) {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <aside className="hidden lg:flex flex-col w-[280px] bg-[#070B13] border-r border-white/5 fixed top-0 left-0 bottom-0 z-50">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
            </svg>
          </div>
          <span className="text-xl font-bold">Vested</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 p-3 bg-[#161b26] rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-full flex items-center justify-center text-sm font-semibold">
            {getInitials(user?.full_name || null)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-[#A5ACBA]">Pro Member</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-nav-item w-full ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={onLogout}
          className="sidebar-nav-item w-full text-[#F04438] hover:text-[#F04438] hover:bg-[#F04438]/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
}

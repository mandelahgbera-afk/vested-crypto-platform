import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Page } from '@/App';
import { Eye, EyeOff, User, Lock, ArrowRight, Shield, AlertTriangle } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (page: Page) => void;
}

export default function AdminLoginPage({ onNavigate }: AdminLoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { adminLogin } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      showToast('Please enter both username and password', 'error');
      return;
    }
    
    setIsLoading(true);
    const success = await adminLogin(username, password);
    setIsLoading(false);
    
    if (success) {
      showToast('Welcome, Administrator!', 'success');
      onNavigate('admin');
    } else {
      showToast('Invalid credentials', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C111D] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
            <p className="text-[#A5ACBA]">Super Administrator Portal</p>
          </div>

          {/* Warning Banner */}
          <div className="mb-6 p-4 bg-[#F79009]/10 border border-[#F79009]/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#F79009] flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-[#F79009] font-medium mb-1">Restricted Access</p>
                <p className="text-[#A5ACBA]">This area is for authorized administrators only. All login attempts are logged.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="input-dark pl-12"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark pl-12 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Admin Panel
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('landing')}
              className="text-sm text-[#A5ACBA] hover:text-white transition-colors"
            >
              ← Back to main site
            </button>
          </div>

          {/* Default Credentials Info */}
          <div className="mt-8 p-4 bg-[#161b26] border border-white/10 rounded-lg">
            <p className="text-xs text-[#667085] mb-2">Default Credentials:</p>
            <div className="text-xs text-[#A5ACBA] space-y-1 font-mono">
              <p><span className="text-[#6941C6]">Username:</span> admin</p>
              <p><span className="text-[#6941C6]">Password:</span> VestedAdmin2024!</p>
            </div>
            <p className="text-xs text-[#F79009] mt-2">
              ⚠️ Change these credentials immediately after first login!
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-[#070B13] relative items-center justify-center p-12 overflow-hidden">
        {/* Orbs */}
        <div className="orb w-[400px] h-[400px] bg-[#6941C6] top-[20%] left-[20%] animate-float" />
        <div className="orb w-[300px] h-[300px] bg-[#d534d8] bottom-[20%] right-[20%] animate-float-reverse" />

        {/* Admin Preview Card */}
        <div className="relative z-10 glass-card p-8 max-w-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Admin Dashboard</h3>
              <p className="text-sm text-[#A5ACBA]">Full platform control</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#070B13]/50 rounded-lg">
              <div className="w-8 h-8 bg-[#17B26A]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#17B26A] text-sm font-bold">U</span>
              </div>
              <span className="text-sm">User Management</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#070B13]/50 rounded-lg">
              <div className="w-8 h-8 bg-[#6941C6]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#6941C6] text-sm font-bold">$</span>
              </div>
              <span className="text-sm">Transaction Control</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#070B13]/50 rounded-lg">
              <div className="w-8 h-8 bg-[#F79009]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#F79009] text-sm font-bold">S</span>
              </div>
              <span className="text-sm">System Settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

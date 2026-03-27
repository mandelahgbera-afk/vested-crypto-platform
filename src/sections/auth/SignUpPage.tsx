import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Page } from '@/App';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';

interface SignUpPageProps {
  onNavigate: (page: Page) => void;
}

export default function SignUpPage({ onNavigate }: SignUpPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    if (!agreeTerms) {
      showToast('Please agree to the terms', 'error');
      return;
    }
    
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await signup(email, password, fullName);
      
      if (success) {
        showToast('Account created! Check your email to verify.', 'success');
        // Redirect to auth callback will happen when user clicks email link
      } else {
        showToast('Failed to create account. Try again.', 'error');
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Error: ${errMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C111D] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 text-[#A5ACBA] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
              </svg>
            </div>
            <span className="text-xl font-bold">Vested</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-[#A5ACBA]">Start your crypto journey with Vested today.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="input-dark pl-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#667085]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-dark pl-12"
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-[#667085] mt-1">
                Must be at least 8 characters with a number and special character.
              </p>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#6941C6]"
                />
                <span className="text-sm text-[#A5ACBA]">
                  I agree to the{' '}
                  <button type="button" className="text-[#6938ef] hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-[#6938ef] hover:underline">Privacy Policy</button>
                </span>
              </label>
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
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#0C111D] text-sm text-[#667085]">Or sign up with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => showToast('Google signup coming soon!', 'info')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#161b26] border border-white/10 rounded-lg hover:bg-[#1F242F] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm">Google</span>
            </button>
            <button 
              onClick={() => showToast('GitHub signup coming soon!', 'info')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#161b26] border border-white/10 rounded-lg hover:bg-[#1F242F] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm">GitHub</span>
            </button>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-[#A5ACBA]">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('signin')}
              className="text-[#6938ef] hover:text-[#6941C6] font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-[#070B13] relative items-center justify-center p-12 overflow-hidden">
        {/* Orbs */}
        <div className="orb w-[400px] h-[400px] bg-[#6941C6] top-[20%] left-[20%] animate-float" />
        <div className="orb w-[300px] h-[300px] bg-[#d534d8] bottom-[20%] right-[20%] animate-float-reverse" />

        {/* Stats Grid */}
        <div className="relative z-10 space-y-4 max-w-sm">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#A5ACBA]">Total Users</span>
              <span className="badge-positive">+24%</span>
            </div>
            <p className="text-2xl font-bold">50,000+</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#A5ACBA]">Assets Staked</span>
              <span className="badge-positive">+18%</span>
            </div>
            <p className="text-2xl font-bold">$120M+</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#A5ACBA]">APY Up To</span>
              <span className="badge-neutral">Best Rates</span>
            </div>
            <p className="text-2xl font-bold text-[#17B26A]">12%</p>
          </div>
        </div>

        {/* Quote */}
        <blockquote className="relative z-10 mt-8 text-center max-w-sm">
          <p className="text-white/80 italic">"Join thousands of investors earning passive income with Vested's secure staking platform."</p>
        </blockquote>
      </div>
    </div>
  );
}

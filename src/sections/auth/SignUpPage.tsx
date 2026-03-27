import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Page } from '@/App';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';

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
  const [confirmationSent, setConfirmationSent] = useState(false);

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
      const result = await signup(email, password, fullName);

      if (result.success && result.needsConfirmation) {
        setConfirmationSent(true);
        showToast('Check your email to verify your account!', 'success');
      } else if (result.success && !result.needsConfirmation) {
        showToast('Account created successfully!', 'success');
        onNavigate('dashboard');
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

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-[#0C111D] flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Check your email</h1>
          <p className="text-[#A5ACBA] mb-2">
            We sent a verification link to <span className="text-white font-medium">{email}</span>
          </p>
          <p className="text-[#A5ACBA] text-sm mb-8">
            Click the link in the email to verify your account and get started.
          </p>
          <button
            onClick={() => onNavigate('signin')}
            className="btn-primary w-full"
          >
            Go to Sign In
          </button>
          <p className="mt-4 text-sm text-[#A5ACBA]">
            Didn&apos;t receive the email?{' '}
            <button
              onClick={() => setConfirmationSent(false)}
              className="text-[#6938ef] hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C111D] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 text-[#A5ACBA] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to home</span>
          </button>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Vested</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-[#A5ACBA]">Start your crypto journey with Vested today.</p>
          </div>

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
                  placeholder="Min 8 characters"
                  className="input-dark pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#6938ef] cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-[#A5ACBA] cursor-pointer">
                I agree to the{' '}
                <span className="text-[#6938ef]">Terms of Service</span> and{' '}
                <span className="text-[#6938ef]">Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#A5ACBA]">
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
        <div className="orb w-[400px] h-[400px] bg-[#6941C6] top-[20%] left-[20%] animate-float" />
        <div className="orb w-[300px] h-[300px] bg-[#d534d8] bottom-[20%] right-[20%] animate-float-reverse" />

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

        <blockquote className="relative z-10 mt-8 text-center max-w-sm">
          <p className="text-white/80 italic">&quot;Join thousands of investors earning passive income with Vested&apos;s secure staking platform.&quot;</p>
        </blockquote>
      </div>
    </div>
  );
}

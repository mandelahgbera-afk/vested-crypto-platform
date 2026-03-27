import { useEffect, useRef, useState } from 'react';
import type { Page } from '@/App';
import { 
  Shield, BarChart3, Zap, Globe, Lock, ArrowRight, Play, Users, TrendingUp, Check,
  Wallet, Sparkles, Settings
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Secure Staking',
      description: 'Earn passive income with our secure staking infrastructure. Up to 12% APY on major cryptocurrencies.',
      color: 'from-[#6938ef] to-[#d534d8]',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track your portfolio performance with advanced analytics and real-time market data.',
      color: 'from-[#0082f3] to-[#00a8ff]',
    },
    {
      icon: Zap,
      title: 'Instant Withdrawals',
      description: 'Access your funds instantly with our automated withdrawal system. No waiting periods.',
      color: 'from-[#F79009] to-[#FFB347]',
    },
    {
      icon: Globe,
      title: 'Multi-Chain Support',
      description: 'Support for 50+ blockchains. Manage all your crypto assets in one unified dashboard.',
      color: 'from-[#17B26A] to-[#4ADE80]',
    },
    {
      icon: Lock,
      title: 'Institutional Security',
      description: 'Bank-grade security with multi-sig wallets, cold storage, and 24/7 monitoring.',
      color: 'from-[#d534d8] to-[#ff6b9d]',
    },
    {
      icon: Wallet,
      title: 'Smart Wallet',
      description: 'Connect any wallet, manage all your assets, and track performance in one place.',
      color: 'from-[#6938ef] to-[#d534d8]',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: Users,
      title: 'Create Account',
      description: 'Sign up in seconds with your email. No complex verification required.',
    },
    {
      number: '02',
      icon: Wallet,
      title: 'Connect Wallet',
      description: 'Link your existing crypto wallet or create a new one securely.',
    },
    {
      number: '03',
      icon: Sparkles,
      title: 'Start Earning',
      description: 'Choose your assets, select staking terms, and start earning immediately.',
    },
  ];

  const testimonials = [
    {
      quote: 'Vested has completely transformed how I manage my crypto portfolio. The staking rewards are incredible.',
      author: 'Sarah Chen',
      role: 'Crypto Investor',
      initials: 'SC',
    },
    {
      quote: 'The real-time analytics and instant withdrawals make Vested stand out from every other platform.',
      author: 'Michael Roberts',
      role: 'Day Trader',
      initials: 'MR',
    },
    {
      quote: 'Finally, a platform that understands what crypto investors need. Multi-chain support is a game-changer.',
      author: 'Emma Watson',
      role: 'DeFi Enthusiast',
      initials: 'EW',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for getting started with crypto investing.',
      features: [
        'Portfolio tracking',
        'Basic analytics',
        '1 connected wallet',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For serious investors who want advanced features.',
      features: [
        'Everything in Starter',
        'Advanced analytics',
        'Unlimited wallets',
        'Priority support',
        'Tax reporting',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For institutions and high-volume traders.',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
      ],
      popular: false,
    },
  ];

  const cryptoStats = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$64,230', change: '+2.4%', positive: true },
    { symbol: 'ETH', name: 'Ethereum', price: '$3,450', change: '+1.8%', positive: true },
    { symbol: 'SOL', name: 'Solana', price: '$145', change: '+5.2%', positive: true },
    { symbol: 'ADA', name: 'Cardano', price: '$0.45', change: '-0.5%', positive: false },
  ];

  return (
    <div className="min-h-screen bg-[#0C111D]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0C111D]/90 backdrop-blur-xl border-b border-white/5' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold">Vested</span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-[#A5ACBA] hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-[#A5ACBA] hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-[#A5ACBA] hover:text-white transition-colors">Pricing</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('admin-login')}
                className="hidden sm:flex items-center gap-2 text-sm text-[#A5ACBA] hover:text-white transition-colors"
                title="Admin Access"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('signin')}
                className="hidden sm:block text-sm text-[#A5ACBA] hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary text-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[800px] h-[800px] bg-[#6941C6]/20 rounded-full blur-[120px] -top-[20%] -left-[10%] animate-pulse" />
          <div className="absolute w-[600px] h-[600px] bg-[#d534d8]/15 rounded-full blur-[100px] top-[40%] right-[-10%] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute w-[400px] h-[400px] bg-[#0082f3]/10 rounded-full blur-[80px] bottom-[10%] left-[30%] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(105,65,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(105,65,198,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
                <span className="w-2 h-2 bg-[#17B26A] rounded-full animate-pulse" />
                <span className="text-sm text-[#A5ACBA]">Now supporting 50+ blockchains</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Invest in the{' '}
                <span className="gradient-text">Future</span>{' '}
                of Money
              </h1>

              <p className="text-lg text-[#A5ACBA] mb-8 max-w-lg mx-auto lg:mx-0">
                Stake, earn, and grow your crypto portfolio with institutional-grade security and seamless user experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <button
                  onClick={() => onNavigate('signup')}
                  className="btn-primary"
                >
                  Start Investing
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => alert('Demo coming soon!')}
                  className="btn-secondary"
                >
                  <Play className="w-4 h-4" />
                  View Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-[#A5ACBA]">
                  <Users className="w-4 h-4 text-[#6941C6]" />
                  <span>50,000+ investors</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#A5ACBA]">
                  <TrendingUp className="w-4 h-4 text-[#6941C6]" />
                  <span>Up to 12% APY</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#A5ACBA]">
                  <Shield className="w-4 h-4 text-[#6941C6]" />
                  <span>Bank-grade security</span>
                </div>
              </div>
            </div>

            {/* Hero Visual - Live Crypto Dashboard */}
            <div className="relative hidden lg:block">
              <div className="glass-card p-6 transform hover:scale-[1.02] transition-transform duration-500 border-[#6941C6]/20">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-[#A5ACBA] mb-1">Total Balance</p>
                    <h3 className="text-3xl font-bold">$200,000.00</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="w-4 h-4 text-[#17B26A]" />
                      <span className="text-sm text-[#17B26A]">+12.5%</span>
                      <span className="text-sm text-[#667085]">this month</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#17B26A]/20 rounded-full">
                    <span className="w-2 h-2 bg-[#17B26A] rounded-full animate-pulse" />
                    <span className="text-xs text-[#17B26A]">Live</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <button className="btn-outline flex-1 text-sm py-2">Withdraw</button>
                  <button className="btn-primary flex-1 text-sm py-2">Deposit</button>
                </div>

                {/* Crypto List */}
                <div className="space-y-3">
                  {cryptoStats.map((coin) => (
                    <div key={coin.symbol} className="flex items-center justify-between p-3 bg-[#070B13]/50 rounded-xl hover:bg-[#070B13] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 crypto-icon-${coin.symbol.toLowerCase()} rounded-xl flex items-center justify-center text-sm font-bold`}>
                          {coin.symbol[0]}
                        </div>
                        <div>
                          <p className="font-medium">{coin.symbol}</p>
                          <p className="text-xs text-[#A5ACBA]">{coin.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{coin.price}</p>
                        <p className={`text-xs ${coin.positive ? 'text-[#17B26A]' : 'text-[#F04438]'}`}>
                          {coin.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-4 -left-4 glass-card p-4 flex items-center gap-3 animate-float border-[#17B26A]/20">
                <div className="w-12 h-12 bg-gradient-to-br from-[#17B26A] to-[#4ADE80] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#A5ACBA]">Monthly Earnings</p>
                  <p className="text-[#17B26A] font-bold text-lg">+$2,450.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6941C6]/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#6941C6]/10 border border-[#6941C6]/20 rounded-full text-sm text-[#6941C6] mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Invest</span>
            </h2>
            <p className="text-[#A5ACBA] text-lg">
              Powerful tools and features designed for both beginners and experienced crypto investors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group glass-card p-6 hover:border-[#6941C6]/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-[#A5ACBA] text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#6941C6]/10 border border-[#6941C6]/20 rounded-full text-sm text-[#6941C6] mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Start Investing in <span className="gradient-text">3 Steps</span>
            </h2>
            <p className="text-[#A5ACBA] text-lg">Get started with Vested in minutes, not days.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#6941C6]/30 to-transparent" />
            
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#6941C6]/20">
                  <span className="text-2xl font-bold">{step.number}</span>
                </div>
                <div className="w-14 h-14 bg-[#161b26] border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-[#6941C6]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-[#A5ACBA] text-sm max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6941C6]/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#6941C6]/10 border border-[#6941C6]/20 rounded-full text-sm text-[#6941C6] mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">Investors</span>
            </h2>
            <p className="text-[#A5ACBA] text-lg">Join thousands of satisfied investors who trust Vested.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="glass-card p-6 hover:border-[#6941C6]/30 transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-[#F79009] fill-current" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className="text-[#A5ACBA] mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-xl flex items-center justify-center text-sm font-semibold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-[#A5ACBA]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#6941C6]/10 border border-[#6941C6]/20 rounded-full text-sm text-[#6941C6] mb-4">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
            <p className="text-[#A5ACBA] text-lg">Choose the plan that fits your investment goals.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`glass-card p-6 relative ${
                  plan.popular ? 'border-[#6941C6]/50 shadow-[0_0_40px_rgba(105,56,239,0.15)]' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#6938ef] to-[#d534d8] rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-[#A5ACBA]">{plan.period}</span>}
                </div>
                <p className="text-sm text-[#A5ACBA] mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 bg-[#6941C6]/20 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#6941C6]" />
                      </div>
                      <span className="text-[#A5ACBA]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate('signup')}
                  className={plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}
                >
                  {plan.popular ? 'Start Pro Trial' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative bg-gradient-to-r from-[#6938ef] to-[#d534d8] rounded-3xl p-12 text-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute w-64 h-64 bg-white/10 rounded-full -top-20 -left-20 blur-3xl animate-pulse" />
            <div className="absolute w-48 h-48 bg-white/10 rounded-full -bottom-10 -right-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Ready to Start Your Crypto Journey?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 text-lg">
                Join 50,000+ investors already earning with Vested. No hidden fees, no complicated setup.
              </p>
              <button
                onClick={() => onNavigate('signup')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#6941C6] font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Clean & Minimal */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6938ef] to-[#d534d8] rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold">Vested</span>
            </div>

            {/* Links - Only essential pages */}
            <div className="flex items-center gap-8">
              <button onClick={() => onNavigate('signin')} className="text-sm text-[#A5ACBA] hover:text-white transition-colors">
                Sign In
              </button>
              <button onClick={() => onNavigate('signup')} className="text-sm text-[#A5ACBA] hover:text-white transition-colors">
                Sign Up
              </button>
              <a href="#features" className="text-sm text-[#A5ACBA] hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-[#A5ACBA] hover:text-white transition-colors">
                Pricing
              </a>
            </div>

            {/* Social - Only Twitter/X and Discord */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#161b26] border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#1F242F] hover:border-[#6941C6]/30 transition-all"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#161b26] border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#1F242F] hover:border-[#6941C6]/30 transition-all"
                aria-label="Discord"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-[#667085]">© 2024 Vested. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

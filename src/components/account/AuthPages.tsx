import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginDemo, getDemoUser } from '../../data/accountMockData';
import './AccountStyles.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.from || '/account';

  const [email, setEmail] = React.useState('arjun.mehta@example.com');
  const [password, setPassword] = React.useState('••••••••');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      loginDemo(email, 'Arjun Mehta');
      setIsLoading(false);
      navigate(returnTo);
    }, 400);
  };

  const handleQuickDemo = () => {
    loginDemo('arjun.mehta@example.com', 'Arjun Mehta');
    navigate(returnTo);
  };

  return (
    <div className="fox-account-page py-16 sm:py-24 px-4 sm:px-6">
      <div className="fox-auth-card">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-xl font-black uppercase tracking-wider text-ink font-display">
            FUNKY <span className="text-[#E87535]">FOX</span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-ink">
            Customer Sign In
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Access your orders, tracked shipments, and saved fit wishlist.
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-left">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-[#92400E] shrink-0 mt-0.5" />
            <div className="text-xs text-[#92400E] leading-relaxed">
              <span className="font-bold">Interactive Frontend Demo:</span> No real password is required or stored. Click below to sign in instantly as sample customer <span className="font-semibold underline">Arjun Mehta</span>.
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="mt-3 w-full py-2 px-3 rounded-lg bg-[#92400E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#78350F] transition-colors shadow-sm"
          >
            1-Click Demo Sign In →
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#E87535] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm pr-10 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-full bg-ink text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-neutral-500 border-t border-neutral-100 pt-6">
          New to Funky Fox?{' '}
          <Link to="/register" className="font-bold text-ink hover:text-[#E87535] underline underline-offset-2">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [agreed, setAgreed] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      loginDemo(email, name);
      setIsLoading(false);
      navigate('/account');
    }, 400);
  };

  return (
    <div className="fox-account-page py-16 sm:py-24 px-4 sm:px-6">
      <div className="fox-auth-card">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-xl font-black uppercase tracking-wider text-ink font-display">
            FUNKY <span className="text-[#E87535]">FOX</span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-ink">
            Create Account
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Join the Fox Club for member pricing, easy returns, and saved fits.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="rahul@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a secure password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <label className="flex items-start gap-2.5 pt-1 text-xs text-neutral-600 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-fox focus:ring-fox"
            />
            <span>I agree to Funky Fox's Terms of Service and Privacy Policy.</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-full bg-ink text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-neutral-500 border-t border-neutral-100 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-ink hover:text-[#E87535] underline underline-offset-2">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubmitted(true);
    }
  };

  return (
    <div className="fox-account-page py-16 sm:py-24 px-4 sm:px-6">
      <div className="fox-auth-card">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-xl font-black uppercase tracking-wider text-ink font-display">
            FUNKY <span className="text-[#E87535]">FOX</span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-ink">
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Enter your email and we'll send demo instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
            <h3 className="text-sm font-bold text-green-900">Demo Reset Email Sent</h3>
            <p className="mt-1 text-xs text-green-700 leading-relaxed">
              In production, a secure verification link would be sent to <span className="font-semibold">{email}</span>. Since this is an interactive frontend demo, your demo session remains active.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block py-2 px-5 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-ink text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-semibold text-neutral-600 hover:text-ink">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


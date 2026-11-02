import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Sparkles,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Award
} from 'lucide-react';
import { loginDemo, getDemoUser, isDemoLoggedIn } from '../../data/accountMockData';
import { showToast } from '../../utils/toast';
import './AccountStyles.css';
import './AuthStyles.css';

interface AuthSplitScreenProps {
  initialMode: 'login' | 'register';
}

function AuthSplitScreen({ initialMode }: AuthSplitScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as any;
  const returnTo = locationState?.from || '/account';
  const pendingAdd = locationState?.pendingAdd;
  const authNotice = locationState?.reason || (pendingAdd ? 'Please sign in or create an account to add items to your bag.' : null);

  const [mode, setMode] = React.useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = React.useState('arjun.mehta@example.com');
  const [password, setPassword] = React.useState('••••••••');
  const [name, setName] = React.useState('Arjun Mehta');
  const [phone, setPhone] = React.useState('+91 98765 43210');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [agreed, setAgreed] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Sync mode if URL changes
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isDemoLoggedIn()) {
      navigate(returnTo, { replace: true });
    }
  }, [navigate, returnTo]);

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    navigate(newMode === 'login' ? '/login' : '/register', {
      replace: true,
      state: location.state
    });
  };

  const handleSuccessfulAuth = (authEmail: string, authName: string, authPhone?: string) => {
    const user = loginDemo(authEmail, authName, authPhone);

    // If there was a pending item to be added to cart, safely merge it
    if (pendingAdd?.product) {
      try {
        const existingCartRaw = localStorage.getItem('funky-fox-cart');
        const existingCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];
        const prod = pendingAdd.product;
        const color = pendingAdd.color || prod.colors?.[0]?.name || 'Default';
        const size = pendingAdd.size || prod.sizes?.[0] || 'M';
        const qty = pendingAdd.qty || 1;

        const matchIdx = existingCart.findIndex(
          (item: any) => item.id === prod.id && item.size === size && item.color === color
        );

        if (matchIdx > -1) {
          existingCart[matchIdx].qty += qty;
        } else {
          existingCart.push({ id: prod.id, size, color, qty });
        }

        localStorage.setItem('funky-fox-cart', JSON.stringify(existingCart));
        window.dispatchEvent(new Event('storage'));
        showToast(`Welcome back, ${user.name.split(' ')[0]}! ${prod.name} (${size}) added to your bag.`, {
          type: 'success'
        });
      } catch (err) {
        console.error('Error adding pending item to cart:', err);
      }
    } else {
      showToast(`Welcome to Funky Fox, ${user.name.split(' ')[0]}!`, { type: 'success' });
    }

    navigate(returnTo, { replace: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!agreed) {
        setError('Please agree to the Terms of Service to continue.');
        return;
      }
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      handleSuccessfulAuth(
        email,
        mode === 'register' ? name : (email === 'arjun.mehta@example.com' ? 'Arjun Mehta' : email.split('@')[0]),
        mode === 'register' ? phone : undefined
      );
    }, 450);
  };

  const handleQuickDemoSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      handleSuccessfulAuth('arjun.mehta@example.com', 'Arjun Mehta', '+91 98765 43210');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center">
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* ================= LEFT COLUMN: 21ST.DEV STYLE AUTH FORM ================= */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 bg-white border-r border-[#EFECE6] z-10">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <span className="font-display text-xl font-black uppercase tracking-tight text-ink group-hover:text-[#E87535] transition-colors">
                  FUNKY <span className="text-[#E87535]">FOX</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E5E1D8] text-neutral-600">
                  Storefront
                </span>
              </Link>

              <Link
                to="/products"
                className="text-xs font-semibold text-neutral-500 hover:text-ink transition-colors flex items-center gap-1"
              >
                Return to Shop <ArrowRight size={13} />
              </Link>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink">
                {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                {mode === 'login'
                  ? 'Sign in to access your bag, saved fits, and tracked orders.'
                  : 'Join the Fox Club for member pricing, easy returns, and instant bag access.'}
              </p>
            </div>

            {/* Auth Notice (If redirected from Add-to-bag or Checkout) */}
            {authNotice && (
              <div className="mb-6 p-3.5 rounded-xl bg-orange-50/80 border border-orange-200/90 text-left flex items-start gap-2.5 shadow-xs">
                <ShoppingBag size={17} className="text-[#E87535] shrink-0 mt-0.5" />
                <div className="text-xs text-orange-950 leading-relaxed">
                  <span className="font-bold text-[#E87535]">Account Required: </span>
                  {authNotice}
                </div>
              </div>
            )}

            {/* 21st.dev Segmented Tab Switcher */}
            <div className="mb-6 p-1 rounded-full bg-[#F3EFEA] flex items-center border border-[#E8E4DC]">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`fox-auth-tab-pill ${
                  mode === 'login' ? 'fox-auth-tab-pill--active' : 'fox-auth-tab-pill--inactive'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className={`fox-auth-tab-pill ${
                  mode === 'register' ? 'fox-auth-tab-pill--active' : 'fox-auth-tab-pill--inactive'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* High Priority 1-Click Interactive Demo Sign-In Card */}
            <div className="mb-6 fox-demo-badge-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[#D97706]/15 flex items-center justify-center shrink-0 mt-0.5 text-[#B45309]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#92400E]">
                      1-Click Interactive Demo Login
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[#A16207] leading-relaxed">
                      Instant verification as test customer <span className="font-bold underline">Arjun Mehta</span>. No password needed.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                disabled={isLoading}
                className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#92400E] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#78350F] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
              >
                {isLoading ? 'Authenticating...' : 'Sign In as Arjun Mehta (Demo) →'}
              </button>
            </div>

            {/* Social Google Demo Button (21st.dev style) */}
            <button
              type="button"
              onClick={handleQuickDemoSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-[#DCD7CD] bg-white text-xs font-bold text-neutral-800 hover:bg-[#FAF9F6] transition-colors flex items-center justify-center gap-2.5 mb-5 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google (Demo)</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-[#E8E4DC]" />
              <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Or Continue With Email
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="fox-auth-input-group">
                    <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="fox-auth-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Email Address
                </label>
                <div className="fox-auth-input-group">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="fox-auth-input"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Phone Number (Optional for order SMS)
                  </label>
                  <div className="fox-auth-input-group">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="fox-auth-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Password
                  </label>
                  {mode === 'login' && (
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-[#E87535] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="fox-auth-input-group">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="fox-auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'login' ? (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-neutral-300 text-[#E87535] focus:ring-[#E87535]"
                    />
                    <span>Remember this browser</span>
                  </label>
                </div>
              ) : (
                <label className="flex items-start gap-2.5 pt-1 text-xs text-neutral-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-[#E87535] focus:ring-[#E87535]"
                  />
                  <span>
                    I agree to Funky Fox's Terms of Service and Privacy Policy.
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 rounded-full bg-ink text-white font-bold text-xs uppercase tracking-wider hover:bg-[#E87535] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Funky Fox' : 'Create Member Account'}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footnote */}
          <div className="mt-8 pt-6 border-t border-[#F0ECE1] flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#E87535]" />
              Local secure demo environment
            </span>
            <span>Funky Fox Menswear © 2026</span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: REACTBITS.DEV ANIMATED MESH GRADIENT & EDITORIAL SHOWCASE ================= */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative overflow-hidden flex-col justify-between p-10 xl:p-16 text-white min-h-screen">
          {/* reactbits.dev Animated Fluid Mesh Gradient Background */}
          <div className="fox-auth-mesh-wrap">
            <div className="fox-mesh-orb-1" />
            <div className="fox-mesh-orb-2" />
            <div className="fox-mesh-orb-3" />
            <div className="fox-mesh-orb-4" />
            <div className="fox-mesh-grid-overlay" />
          </div>

          {/* Top Tagline Pill */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>The Contemporary Edit · 2026</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="ml-1 text-white text-[11px]">4.9/5 Rating</span>
            </div>
          </div>

          {/* Central Editorial Visual Presentation */}
          <div className="relative z-10 my-auto py-8 max-w-lg">
            {/* Cutout Editorial Model Image */}
            <div className="relative mx-auto w-full max-w-[340px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
              <img
                src="/images/standard/cta-model-denim.png"
                alt="Funky Fox Menswear Editorial Fit"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/editorial-campaign.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Floating Live Badge inside image */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                  Everyday Denim &amp; Overshirts
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#E87535] text-white text-[10px] font-black uppercase">
                  DROP 01
                </span>
              </div>
            </div>

            {/* Headline Statement */}
            <h2 className="mt-8 font-display text-2xl xl:text-3xl font-black uppercase tracking-tight text-white leading-tight">
              Crafted For Movement, Cut For Poise.
            </h2>
            <p className="mt-2 text-xs xl:text-sm text-neutral-300 leading-relaxed font-normal">
              From heavy cotton drop-shoulder tees to structured wool overcoats — built for real Indian weather, fit without compromise.
            </p>
          </div>

          {/* Bottom Glassmorphic Social Proof / Guarantee Strip */}
          <div className="relative z-10 fox-editorial-glass rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/10">
              <div className="flex flex-col items-center gap-1">
                <Truck size={17} className="text-[#E87535]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">Free Delivery</span>
                <span className="text-[10px] text-neutral-400">Above ₹1,499</span>
              </div>

              <div className="flex flex-col items-center gap-1 pl-3">
                <RotateCcw size={17} className="text-[#E87535]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">15-Day Returns</span>
                <span className="text-[10px] text-neutral-400">Doorstep pickup</span>
              </div>

              <div className="flex flex-col items-center gap-1 pl-3">
                <Award size={17} className="text-[#E87535]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">Fox Club Club</span>
                <span className="text-[10px] text-neutral-400">Exclusive perks</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export function LoginPage() {
  return <AuthSplitScreen initialMode="login" />;
}

export function RegisterPage() {
  return <AuthSplitScreen initialMode="register" />;
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
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-16 px-4 sm:px-6">
      <div className="fox-auth-card mx-auto w-full max-w-md bg-white border border-[#E8E4DC] p-8 rounded-2xl shadow-sm">
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
              className="mt-4 inline-block py-2.5 px-6 rounded-full bg-ink text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
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
              <div className="fox-auth-input-group">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="fox-auth-input"
                />
              </div>
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

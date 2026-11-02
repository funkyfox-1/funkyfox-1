import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { loginDemo, getDemoUser, isDemoLoggedIn } from '../../data/accountMockData';
import { showToast } from '../../utils/toast';
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
  const authNotice =
    locationState?.reason ||
    (pendingAdd ? 'Please sign in or create an account to add items to your bag.' : null);

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

  // Sync mode if route prop changes
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isDemoLoggedIn()) {
      navigate(returnTo, { replace: true });
    }
  }, [navigate, returnTo]);

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
        mode === 'register'
          ? name
          : email === 'arjun.mehta@example.com'
          ? 'Arjun Mehta'
          : email.split('@')[0],
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
    <div className="min-h-screen bg-white font-inter flex flex-col justify-center">
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* ================= LEFT PANEL: SOLID BRAND ORANGE #E05A1B + GEOMETRIC DOT-GRID ================= */}
        <div className="ff-auth-left-panel flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 relative">
          
          {/* TOP: Wordmark */}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              to="/"
              className="font-bricolage text-2xl font-black uppercase tracking-tight text-white inline-block hover:opacity-90 transition-opacity"
            >
              FUNKY FOX
            </Link>
            <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider text-white/80 border border-white/25 rounded-full px-3 py-0.5">
              Customer Portal
            </span>
          </div>

          {/* MIDDLE: Value-Prop Headline + Apricot Underline + Testimonial */}
          <div className="relative z-10 my-10 lg:my-auto max-w-xl">
            {/* Oversized 2 to 3 Line Value-Prop Headline */}
            <h1 className="font-bricolage text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.08] tracking-tight">
              Ship your best work,{' '}
              <span className="ff-apricot-underline inline-block">faster.</span>
            </h1>

            {/* Short Translucent-White Supporting Line */}
            <p className="mt-4 text-base sm:text-lg text-white/75 leading-relaxed font-normal">
              The unified platform for teams who want to stop managing tools and start building products. Everyday menswear essentials, easy layers and precision fits.
            </p>

            {/* Minimal Inline Testimonial with Apricot Stars */}
            <div className="mt-8 sm:mt-10 ff-testimonial-box">
              {/* Five Apricot #ffc95c Stars */}
              <div className="flex items-center gap-1 text-[#ffc95c] text-sm" aria-label="5 out of 5 stars">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              {/* Short Quote */}
              <p className="mt-2.5 text-sm sm:text-[15px] text-white leading-relaxed font-medium">
                "Funky Fox changed the standard for everyday wear. Uncompromising fabric drape, reliable sizing, and express doorstep delivery across India."
              </p>

              {/* Attribution */}
              <div className="mt-3.5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-white text-[#E05A1B] font-bricolage font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  AM
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Arjun Mehta</div>
                  <div className="text-[11px] text-white/75">Lead Designer &amp; Club Member</div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM: Trusted by Modern Teams + Text-Only Client Wordmarks */}
          <div className="relative z-10 pt-6 border-t border-white/15">
            <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/70 mb-3.5">
              TRUSTED BY MODERN TEAMS
            </div>
            <div className="flex items-center flex-wrap gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-wider text-white/75">
              <span>ACME CORP</span>
              <span>GLOBEX</span>
              <span>SOYLENT</span>
              <span>INITECH</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL: CRISP WHITE AUTH FORM #FFFFFF ================= */}
        <div className="bg-white flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 xl:p-20 relative">
          
          {/* Top-Right: Create Account / Sign In Switch */}
          <div className="flex items-center justify-end text-xs text-[#5b6478]">
            {mode === 'login' ? (
              <span>
                New here?{' '}
                <Link
                  to="/register"
                  onClick={() => setMode('register')}
                  className="font-semibold text-[#E05A1B] hover:underline ml-1"
                >
                  Create account
                </Link>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <Link
                  to="/login"
                  onClick={() => setMode('login')}
                  className="font-semibold text-[#E05A1B] hover:underline ml-1"
                >
                  Sign in
                </Link>
              </span>
            )}
          </div>

          {/* Center Form Card Region */}
          <div className="w-full max-w-md mx-auto my-auto py-8">
            
            {/* Heading Block */}
            <div className="mb-6">
              <h2 className="font-bricolage text-2xl sm:text-3xl font-bold text-[#0d1220]">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#5b6478]">
                {mode === 'login'
                  ? 'Sign in to your account to continue'
                  : 'Start shopping and tracking your orders today'}
              </p>
            </div>

            {/* Auth Notice (If redirected from Add to Bag or Checkout) */}
            {authNotice && (
              <div className="mb-5 p-3 rounded-lg bg-orange-50 border border-orange-200 text-left flex items-start gap-2.5">
                <ShoppingBag size={16} className="text-[#E05A1B] shrink-0 mt-0.5" />
                <div className="text-xs text-orange-950 leading-relaxed font-medium">
                  <span className="font-bold text-[#E05A1B]">Account Required: </span>
                  {authNotice}
                </div>
              </div>
            )}

            {/* 1-Click Interactive Demo Login Button */}
            <div className="mb-5 ff-demo-banner flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#b45309] shrink-0" />
                <span className="text-xs font-semibold text-[#92400e]">
                  Instant Test Sign-In as <strong>Arjun Mehta</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                disabled={isLoading}
                className="py-1 px-3 rounded-md bg-[#92400e] hover:bg-[#78350f] text-white text-[11px] font-bold uppercase tracking-wider shrink-0 transition-colors shadow-xs"
              >
                1-Click Demo →
              </button>
            </div>

            {/* Two Side-By-Side SSO Buttons (Stacked on mobile 390px) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {/* Google SSO */}
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                disabled={isLoading}
                className="ff-sso-btn"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              {/* GitHub SSO */}
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                disabled={isLoading}
                className="ff-sso-btn"
              >
                <svg className="w-4 h-4 shrink-0 fill-[#0d1220]" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Hairline Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-[#e6e8ee]" />
              <span className="absolute bg-white px-3 text-xs text-[#5b6478]">
                or continue with email
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {mode === 'register' && (
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#0d1220] mb-1.5">
                    Full Name
                  </label>
                  <div className="ff-auth-input-wrap">
                    <UserIcon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="ff-auth-input"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#0d1220] mb-1.5">
                  Email address
                </label>
                <div className="ff-auth-input-wrap">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="ff-auth-input"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#0d1220] mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <div className="ff-auth-input-wrap">
                    <Phone
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="ff-auth-input"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#0d1220] mb-1.5">
                  Password
                </label>
                <div className="ff-auth-input-wrap">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="ff-auth-input pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5b6478] hover:text-[#0d1220] transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              {mode === 'login' ? (
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#0d1220] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#dfe2ea] text-[#E05A1B] focus:ring-[#E05A1B]"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#E05A1B] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              ) : (
                <label className="flex items-start gap-2 pt-1 text-xs text-[#5b6478] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-[#dfe2ea] text-[#E05A1B] focus:ring-[#E05A1B]"
                  />
                  <span>
                    I agree to the Terms of Service and Privacy Policy.
                  </span>
                </label>
              )}

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="ff-primary-btn mt-2"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <span>{mode === 'login' ? 'Sign in' : 'Create account'}</span>
                )}
              </button>
            </form>

            {/* Footnote */}
            <div className="mt-6 text-center text-xs text-[#5b6478]">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    onClick={() => setMode('register')}
                    className="font-semibold text-[#E05A1B] hover:underline ml-0.5"
                  >
                    Sign up
                  </Link>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    onClick={() => setMode('login')}
                    className="font-semibold text-[#E05A1B] hover:underline ml-0.5"
                  >
                    Sign in
                  </Link>
                </span>
              )}
            </div>

            <p className="mt-4 text-center text-[11px] text-[#94a3b8] leading-relaxed">
              By signing in, you agree to our{' '}
              <Link to="/help" className="underline hover:text-[#5b6478]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/help" className="underline hover:text-[#5b6478]">
                Privacy Policy
              </Link>
              .
            </p>

          </div>

          {/* Bottom Trust Badge */}
          <div className="text-center text-[11px] text-[#94a3b8] pt-4 border-t border-[#f1f3f7]">
            256-bit encrypted • Funky Fox Menswear Storefront
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
    <div className="min-h-screen bg-[#faf9f6] font-inter flex flex-col justify-center py-16 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md bg-white border border-[#dfe2ea] p-8 rounded-xl shadow-xs">
        <div className="text-center mb-8">
          <Link to="/" className="font-bricolage text-2xl font-black uppercase tracking-tight text-[#0d1220] inline-block">
            FUNKY <span className="text-[#E05A1B]">FOX</span>
          </Link>
          <h1 className="mt-4 font-bricolage text-2xl font-bold text-[#0d1220]">
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-[#5b6478]">
            Enter your email and we'll send demo instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
            <h3 className="text-sm font-bold text-green-900">Demo Reset Email Sent</h3>
            <p className="mt-1 text-xs text-green-700 leading-relaxed">
              In production, a secure verification link would be sent to <span className="font-semibold">{email}</span>. Since this is an interactive demo, your demo session remains active.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block py-2.5 px-6 rounded-lg bg-[#0d1220] text-white text-xs font-semibold hover:bg-[#1a233a] transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0d1220] mb-1.5">
                Your Email Address
              </label>
              <div className="ff-auth-input-wrap">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="ff-auth-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="ff-primary-btn mt-2"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-semibold text-[#5b6478] hover:text-[#0d1220]">
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

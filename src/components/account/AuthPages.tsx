import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  MailCheck
} from 'lucide-react';
import { loginDemo, getDemoUser, isDemoLoggedIn } from '../../data/accountMockData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { showToast } from '../../utils/toast';
import './AuthStyles.css';

interface AuthSplitScreenProps {
  initialMode: 'login' | 'register';
}

function AuthSplitScreen({ initialMode }: AuthSplitScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as any;
  const queryParams = new URLSearchParams(location.search);
  const queryRedirect = queryParams.get('redirect') || queryParams.get('from');

  // Retrieve returnTo and pendingAdd from locationState, query params or fallback to persistent sessionStorage
  const storedReturnTo = typeof window !== 'undefined' ? sessionStorage.getItem('funkyfox_auth_return_to') : null;
  const storedPendingAddRaw = typeof window !== 'undefined' ? sessionStorage.getItem('funkyfox_auth_pending_add') : null;
  const storedPendingAdd = React.useMemo(() => {
    try {
      return storedPendingAddRaw ? JSON.parse(storedPendingAddRaw) : null;
    } catch {
      return null;
    }
  }, [storedPendingAddRaw]);

  const returnTo = queryRedirect || locationState?.from || storedReturnTo || '/account';
  const pendingAdd = locationState?.pendingAdd || storedPendingAdd;
  const authNotice =
    locationState?.reason ||
    (pendingAdd ? 'Please sign in or create an account to add items to your bag.' : null);

  React.useEffect(() => {
    const target = queryRedirect || locationState?.from;
    if (target) {
      try {
        sessionStorage.setItem('funkyfox_auth_return_to', target);
      } catch {}
    }
    if (locationState?.pendingAdd) {
      try {
        sessionStorage.setItem('funkyfox_auth_pending_add', JSON.stringify(locationState.pendingAdd));
      } catch {}
    }
  }, [locationState, queryRedirect]);

  const [mode, setMode] = React.useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [agreed, setAgreed] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Email OTP Authentication States (Mandatory primary auth flow)
  const [authStep, setAuthStep] = React.useState<'form' | 'otp_screen'>('form');
  const [otpDigits, setOtpDigits] = React.useState<string[]>(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = React.useState(0);
  const [otpNotice, setOtpNotice] = React.useState('');
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown timer
  React.useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Sync mode if route prop changes
  React.useEffect(() => {
    setMode(initialMode);
    setAuthStep('form');
  }, [initialMode]);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isDemoLoggedIn()) {
      navigate(returnTo, { replace: true });
    }
  }, [navigate, returnTo]);

  // Listen for Supabase auth state change (handles direct OTP verification & incoming auth redirects)
  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const authedUser = session.user;
        const resolvedName =
          authedUser.user_metadata?.full_name ||
          authedUser.user_metadata?.name ||
          (mode === 'register' && name.trim() ? name.trim() : authedUser.email?.split('@')[0]) ||
          'Customer';
        const resolvedPhone =
          authedUser.user_metadata?.phone ||
          (mode === 'register' && phone.trim() ? phone.trim() : undefined);

        handleSuccessfulAuth(authedUser.email || email, resolvedName, resolvedPhone);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mode, name, phone, email, returnTo, pendingAdd]);

  const handleSuccessfulAuth = (authEmail: string, authName: string, authPhone?: string) => {
    try {
      sessionStorage.removeItem('funkyfox_auth_return_to');
      sessionStorage.removeItem('funkyfox_auth_pending_add');
    } catch {}

    const cleanName = authName?.trim() || authEmail.split('@')[0];
    const user = loginDemo(authEmail, cleanName, authPhone);

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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name before requesting a verification code.');
        return;
      }
      if (!agreed) {
        setError('Please agree to the Terms of Service to continue.');
        return;
      }
    }

    setError('');
    setIsLoading(true);
    setOtpNotice('');

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            shouldCreateUser: true,
            data: mode === 'register' ? {
              full_name: name.trim(),
              phone: phone.trim(),
            } : undefined,
          },
        });

        if (otpError) {
          console.error('[CustomerAuth] Supabase OTP send error:', otpError);
          setError(otpError.message || 'Unable to dispatch verification code. Please check your email.');
          setIsLoading(false);
          return;
        } else {
          setOtpNotice(`6-digit code dispatched via Google SMTP to ${email.trim()}. Please check your inbox and spam folder.`);
        }
      } catch (err: any) {
        console.error('[CustomerAuth] OTP request error:', err);
        setError(err?.message || 'Failed to dispatch code. Please try again.');
        setIsLoading(false);
        return;
      }
    } else {
      setError('Supabase connection is required to send email verification codes.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setAuthStep('otp_screen');
    setOtpCountdown(60);
    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 150);
  };


  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: verifyErr } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code,
          type: 'email',
        });

        if (verifyErr) {
          console.error('[CustomerAuth] Supabase OTP verify error:', verifyErr);
          setError(verifyErr.message || 'Invalid or expired verification code.');
          setIsLoading(false);
          return;
        }

        if (data.user) {
          setIsLoading(false);
          const metaName =
            data.user.user_metadata?.full_name ||
            (mode === 'register' ? name.trim() : email.split('@')[0]);
          const metaPhone =
            data.user.user_metadata?.phone ||
            (mode === 'register' ? phone.trim() : undefined);
          handleSuccessfulAuth(data.user.email || email, metaName, metaPhone);
          return;
        }
      } catch (err: any) {
        console.error('[CustomerAuth] Verify error:', err);
        setError(err?.message || 'Verification failed. Please try again.');
        setIsLoading(false);
        return;
      }
    } else {
      setError('Supabase connection is required to verify OTP code.');
      setIsLoading(false);
      return;
    }

    setError('Invalid verification code.');
    setIsLoading(false);
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = char;
    setOtpDigits(nextDigits);

    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const fullCode = nextDigits.join('');
    if (fullCode.length === 6 && !nextDigits.includes('')) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setOtpDigits(nextDigits);
    const nextFocusIdx = Math.min(pasted.length, 5);
    otpRefs.current[nextFocusIdx]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  return (
    <div className="min-h-screen bg-white font-inter flex flex-col justify-center">
      <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 min-h-screen md:h-screen md:overflow-hidden">

        {/* ================= LEFT PANEL: SOLID BRAND ORANGE #E05A1B + GEOMETRIC DOT-GRID ================= */}
        <div className="ff-auth-left-panel flex flex-col justify-between p-6 sm:p-10 md:p-10 lg:p-14 xl:p-16 relative md:h-screen md:overflow-y-auto">
          
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
              Everyday menswear,{' '}
              <span className="ff-apricot-underline inline-block">crafted for you.</span>
            </h1>

            {/* Short Translucent-White Supporting Line */}
            <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed font-normal">
              Pure combed cotton, relaxed silhouettes, and modern fits delivered directly to your doorstep across India. Sign in to track your orders, manage returns, and unlock member-only releases.
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
                  SR
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Syed R.</div>
                  <div className="text-[11px] text-white/75">Club Member • Verified Buyer</div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM: Text-Only Authentic Trust Badges */}
          <div className="relative z-10 pt-6 border-t border-white/15">
            <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/70 mb-3.5">
              THE FUNKY FOX STANDARD
            </div>
            <div className="flex items-center flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-wider text-white/85">
              <span>100% COMBED COTTON</span>
              <span>•</span>
              <span>EXPRESS DELIVERY</span>
              <span>•</span>
              <span>30-DAY EXCHANGES</span>
              <span>•</span>
              <span>GST: 36DCEPS1960B1Z5</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL: CRISP WHITE AUTH FORM #FFFFFF ================= */}
        <div className="bg-white flex flex-col justify-between p-6 sm:p-10 md:p-10 lg:p-14 xl:p-16 relative md:h-screen md:overflow-y-auto">
          
          {/* Top-Right: Create Account / Sign In Switch */}
          <div className="flex items-center justify-end text-xs text-[#5b6478]">
            {mode === 'login' ? (
              <span>
                New here?{' '}
                <Link
                  to={`/register${location.search}`}
                  state={location.state}
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
                  to={`/login${location.search}`}
                  state={location.state}
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
            
            {authStep === 'otp_screen' ? (
              /* ================= DEDICATED OTP VERIFICATION SCREEN ================= */
              <div className="space-y-6">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('form');
                    setError('');
                    setOtpNotice('');
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#5b6478] hover:text-[#0d1220] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to {mode === 'register' ? 'Registration' : 'Login'}</span>
                </button>

                {/* Header Icon + Title */}
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E05A1B] mb-4 shadow-xs">
                    <MailCheck size={24} />
                  </div>
                  <h2 className="font-bricolage text-2xl sm:text-3xl font-bold text-[#0d1220]">
                    Verify Email Code
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#5b6478] leading-relaxed">
                    {mode === 'register' ? 'Activate your account by entering' : 'Enter'} the 6-digit one-time code sent to:
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f4f5f8] border border-[#e2e5eb]">
                    <span className="text-xs font-semibold text-[#0d1220] font-mono">{email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('form');
                        setError('');
                      }}
                      className="text-[11px] font-bold text-[#E05A1B] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success/Info Notice */}
                {otpNotice && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800 flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">OTP Sent via Google SMTP</p>
                      <p className="mt-0.5 text-green-700">{otpNotice}</p>
                    </div>
                  </div>
                )}

                {/* 6-Digit PIN Boxes */}
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#0d1220] mb-2.5">
                    Enter 6-Digit Code
                  </label>
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        onPaste={handleDigitPaste}
                        aria-label={`Digit ${idx + 1}`}
                        className="w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-lg sm:rounded-xl border border-[#dfe2ea] focus:border-[#E05A1B] focus:ring-2 focus:ring-[#E05A1B]/25 outline-none transition-all bg-white text-[#0d1220] shadow-2xs"
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={isLoading || otpDigits.join('').length < 6}
                  className="ff-primary-btn cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <span>
                      {mode === 'register' ? 'Activate Account & Sign In' : 'Verify & Continue'} →
                    </span>
                  )}
                </button>

                {/* Resend Action */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f1f3f7] text-xs text-[#5b6478]">
                  <span>Didn't receive code?</span>
                  {otpCountdown > 0 ? (
                    <span className="font-medium text-[#94a3b8]">Resend in {otpCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isLoading}
                      className="font-semibold text-[#E05A1B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Resend OTP Code</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ================= CREDENTIALS FORM SCREEN ================= */
              <div>
                {/* Heading Block */}
                <div className="mb-6">
                  <h2 className="font-bricolage text-2xl sm:text-3xl font-bold text-[#0d1220]">
                    {mode === 'login' ? 'Sign in with One-Time Code' : 'Create your account'}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-[#5b6478]">
                    {mode === 'login'
                      ? 'We will dispatch a secure 6-digit verification code to your email'
                      : 'Enter your details to receive your 6-digit activation code'}
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

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Mandatory Email OTP Form */}
                <form onSubmit={handleSendOtp} className="space-y-4">
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

                  {mode === 'register' && (
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

                  {/* Single Mandatory OTP Dispatch Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ff-primary-btn mt-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Sending OTP code...</span>
                    ) : (
                      <>
                        <KeyRound size={15} />
                        <span>
                          {mode === 'login'
                            ? 'Send 6-Digit One-Time Code →'
                            : 'Send 6-Digit Verification Code →'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Footnote */}
            <div className="mt-6 text-center text-xs text-[#5b6478]">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <Link
                    to={`/register${location.search}`}
                    state={location.state}
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
                    to={`/login${location.search}`}
                    state={location.state}
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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#faf9f6] font-inter flex flex-col justify-center py-16 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md bg-white border border-[#dfe2ea] p-8 rounded-xl shadow-xs text-center">
        <Link to="/" className="font-bricolage text-2xl font-black uppercase tracking-tight text-[#0d1220] inline-block">
          FUNKY <span className="text-[#E05A1B]">FOX</span>
        </Link>
        <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E05A1B] mx-auto mt-6 mb-3 shadow-xs">
          <KeyRound size={22} />
        </div>
        <h1 className="font-bricolage text-2xl font-bold text-[#0d1220]">
          Passwordless Sign-In Active
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#5b6478] leading-relaxed">
          Funky Fox uses instant, secure 6-digit one-time email codes. You never need to remember or reset a password.
        </p>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="ff-primary-btn mt-6 cursor-pointer"
        >
          Sign In with Email OTP →
        </button>

        <div className="mt-4">
          <Link to="/" className="text-xs font-semibold text-[#5b6478] hover:text-[#0d1220]">
            Return to Store Home
          </Link>
        </div>
      </div>
    </div>
  );
}

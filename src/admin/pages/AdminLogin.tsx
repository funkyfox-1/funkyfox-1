import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  ArrowRight,
  Database,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminToast } from '../context/ToastContext';

export function AdminLogin() {
  const { user, login, isConfigured } = useAdminAuth();
  const { showToast } = useAdminToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/admin/dashboard';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // If already authenticated, redirect to target
  React.useEffect(() => {
    if (user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      setError(
        'Database backend is unconfigured. Please connect Supabase by defining VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setError('Please provide your administrative email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast('Admin clearance verified. Welcome back!', 'success');
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#171717] items-center justify-center shadow-md mb-3">
            <span className="font-display font-black text-xl text-white">FF</span>
          </div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-zinc-900">
            FUNKY <span className="text-[#FF6B35]">FOX</span>
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Ecommerce Management Console
          </p>
        </div>

        {/* Login or Configuration Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 rounded-2xl border border-zinc-200/80 shadow-sm">
          {!isConfigured ? (
            /* Setup / Configuration Required State */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Database size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Supabase Connection Required</span>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    This admin portal requires a connected Supabase database for authentication and security. Mock accounts have been removed per enterprise policy.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] space-y-2">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                  <Terminal size={12} />
                  <span>Setup Environment Variables</span>
                </div>
                <p className="text-zinc-400 text-[10px]">Create or update your <code>.env</code> file:</p>
                <div className="text-[#FF6B35] select-all">
                  VITE_SUPABASE_URL=https://your-project.supabase.co
                  <br />
                  VITE_SUPABASE_ANON_KEY=your-anon-public-key
                </div>
              </div>

              <div className="text-xs text-zinc-600 space-y-2 pt-2">
                <p className="font-semibold text-zinc-900">Next Steps:</p>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-500">
                  <li>
                    Apply the database migration in{' '}
                    <code className="text-zinc-800 font-semibold">supabase/schema.sql</code>.
                  </li>
                  <li>
                    Create an administrator in Supabase Auth & assign the role in the{' '}
                    <code className="text-zinc-800 font-semibold">admin_users</code> table.
                  </li>
                  <li>Add your API keys to the environment and restart the server.</li>
                </ol>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <a
                  href="/"
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  ← Return to Storefront
                </a>
                <a
                  href="https://supabase.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#FF6B35] hover:underline flex items-center gap-1"
                >
                  Supabase Docs <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ) : (
            /* Real Supabase Login Form */
            <>
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                    Staff Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@funkyfox.in"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all text-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">
                      Password
                    </label>
                    <Link
                      to="/admin/forgot-password"
                      className="text-xs font-semibold text-[#FF6B35] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all text-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-2.5 px-4 bg-[#FF6B35] hover:bg-[#e05624] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
                <span className="text-[11px] text-zinc-400">
                  Authentication enforced via Supabase Auth & RLS.
                </span>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-zinc-400">
          <p>Restricted Access: Authorized staff personnel only.</p>
          <a
            href="/"
            className="mt-2 inline-block font-medium text-zinc-600 hover:text-zinc-900 underline"
          >
            Return to Storefront
          </a>
        </div>
      </div>
    </div>
  );
}

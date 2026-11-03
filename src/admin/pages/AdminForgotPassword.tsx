import * as React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export function AdminForgotPassword() {
  const { resetPassword } = useAdminAuth();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please provide your staff email.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || 'Failed to send recovery instructions.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[#171717] items-center justify-center shadow-md mb-3">
            <span className="font-display font-black text-xl text-white">FF</span>
          </div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-zinc-900">
            Reset Admin Password
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Enter your authorized email to receive recovery instructions.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 sm:px-10 rounded-2xl border border-zinc-200/80 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">Recovery Link Dispatched</h3>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                If an authorized administrator account exists for <span className="font-semibold text-zinc-800">{email}</span>, password reset instructions have been issued.
              </p>
              <Link
                to="/admin/login"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B35] hover:underline"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#FF6B35] hover:bg-[#e05624] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? 'Sending Instructions...' : 'Send Recovery Instructions'}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

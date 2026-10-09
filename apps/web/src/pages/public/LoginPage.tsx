import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Heart, Lock, Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      const isAdmin = user.roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');

      const redirectPath = (location.state as any)?.from?.pathname;
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/member/dashboard', { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
  };

  return (
    <div className="py-12 sm:py-20 max-w-md mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-navy flex items-center justify-center text-white mx-auto shadow-md">
            <Heart className="w-6 h-6 text-brand-coral fill-current" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-navy">Portal Sign In</h1>
          <p className="text-xs text-slate-500">
            Access your donation history, download 80G receipts, or manage trust operations.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Demo Fast Fill Assist */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <p className="font-semibold text-slate-600 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-coral" /> Quick Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@bridgeoflove.org', 'Admin@BridgeOfLove2026!')}
              className="py-1.5 px-2 bg-brand-navy text-white text-[11px] font-semibold rounded-lg hover:bg-brand-navyLight transition"
            >
              Sign In as Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('member@example.com', 'Member@BridgeOfLove2026!')}
              className="py-1.5 px-2 bg-white border border-slate-300 text-slate-700 text-[11px] font-semibold rounded-lg hover:bg-slate-100 transition"
            >
              Sign In as Member
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-coral outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-coral hover:bg-brand-coralHover text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-brand-navy hover:text-brand-coral transition">
            Become a Member Patron
          </Link>
        </div>
      </div>
    </div>
  );
};

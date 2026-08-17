import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to sign in. Please verify your credentials.');
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 bg-white rounded-2xl p-8 border border-[#DDE4DC] shadow-sm">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#12372A] flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6 text-[#B7F34A]" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-[#12372A] tracking-tight">Welcome Back</h2>
          <p className="text-xs text-[#66736A]">Sign in to access your ShopAI account</p>
        </div>

        {!isConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>
              Supabase URL & key are missing in environment configuration. Update <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code> to enable live auth.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66736A]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] placeholder-[#66736A] focus:outline-none focus:border-[#1F6F50]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66736A]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] placeholder-[#66736A] focus:outline-none focus:border-[#1F6F50]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98] disabled:opacity-50"
          >
            <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#66736A] pt-2 border-t border-[#DDE4DC]">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-[#1F6F50] hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

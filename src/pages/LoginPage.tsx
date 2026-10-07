import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email address and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.auth.login({ email, password });
      if (res.token && res.user) {
        login(res.token, res.user);
        if (res.user.role === 'ADMIN') navigate('/admin');
        else navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: 'freelancer' | 'client' | 'admin') => {
    if (role === 'freelancer') {
      setEmail('freelancer@talenttrade.demo');
      setPassword('Demo@123');
    } else if (role === 'client') {
      setEmail('client@talenttrade.demo');
      setPassword('Demo@123');
    } else if (role === 'admin') {
      setEmail('admin@talenttrade.demo');
      setPassword('Admin@123');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.auth.forgotPassword(forgotEmail);
      setForgotMessage(res.message || 'Reset instructions sent.');
    } catch (err: any) {
      setForgotMessage(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 mb-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              TT
            </span>
            <span>TalentTrade</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to manage your services, proposals, and barter contracts.</p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Evaluator Demo Accounts:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">1-click fill</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('freelancer')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 text-center transition-colors shadow-2xs"
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('client')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-100 text-slate-700 font-semibold rounded-lg border border-slate-200 text-center transition-colors shadow-2xs"
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-rose-50 text-rose-700 font-semibold rounded-lg border border-rose-200 text-center transition-colors shadow-2xs"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600 font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Sign up free
          </Link>
        </p>

        {/* Forgot Password Modal */}
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-3 border border-slate-200 shadow-xl">
              <h3 className="text-sm font-bold text-slate-900">Reset Password (Simulated)</h3>
              <p className="text-xs text-slate-500">
                Enter your account email to receive demo password reset instructions.
              </p>
              {forgotMessage ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg">
                  {forgotMessage}
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotModalOpen(false);
                        setForgotMessage(null);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
                    >
                      Send Instructions
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

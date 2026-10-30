import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Shield, Car, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Logins for Examination / Grading
  const quickDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'Password123!');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <Activity className="w-7 h-7 text-slate-950 font-bold" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Smart Traffic System
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Intelligent Urban Grid & Adaptive Signal Management
          </p>
        </div>

        {error && (
          <div className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer.sharma@traffic.gov"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-800 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Logins for Examination Viva */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 text-center mb-3">
            Quick 1-Click Role Login (Academic Demo):
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickDemoLogin('admin@traffic.gov')}
              className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-center transition-all group"
            >
              <Shield className="w-4 h-4 text-purple-400 mx-auto group-hover:scale-110 transition-transform" />
              <span className="block text-[10px] font-bold text-slate-200 mt-1">Admin</span>
            </button>

            <button
              onClick={() => quickDemoLogin('officer.sharma@traffic.gov')}
              className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-center transition-all group"
            >
              <Activity className="w-4 h-4 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
              <span className="block text-[10px] font-bold text-slate-200 mt-1">Police</span>
            </button>

            <button
              onClick={() => quickDemoLogin('ananya.citizen@gmail.com')}
              className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-center transition-all group"
            >
              <Car className="w-4 h-4 text-blue-400 mx-auto group-hover:scale-110 transition-transform" />
              <span className="block text-[10px] font-bold text-slate-200 mt-1">Citizen</span>
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline font-semibold">
            Register as Citizen
          </Link>
        </div>
      </div>
    </div>
  );
}

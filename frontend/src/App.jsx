import React, { useState, useEffect } from 'react';
import api from './services/api';
import { Activity, ShieldCheck, Database, Radio, CheckCircle2, AlertCircle, RefreshCw, Sun, Moon } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/health');
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // initialize dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between transition-colors duration-300">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Smart Traffic Management System
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v1.0.0 Phase 1
                </span>
              </h1>
              <p className="text-xs text-slate-400">Intelligent Telemetry & Adaptive Control Center</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto w-full p-6 my-auto">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">Phase 1: Project Setup & Health Verification</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">Full-Stack Core Operational</h2>
              <p className="text-slate-400 text-sm mt-1">
                Frontend (Vite + React + Tailwind) & Backend (Express + Mongoose + JWT) connected seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {loading ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Checking API...</span>
                </div>
              ) : health ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>API Status: {health.status}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  <span>API Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Backend Server</span>
                <Radio className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-lg font-semibold text-white mt-2">Node.js Express</p>
              <p className="text-xs text-slate-500">Port 5000 (Proxied via Vite :3000)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Database Engine</span>
                <Database className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-lg font-semibold text-white mt-2">MongoDB + Mongoose</p>
              <p className="text-xs text-slate-500">Dual-Mode: Atlas & In-Memory Fallback</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Security Architecture</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-lg font-semibold text-white mt-2">JWT & RBAC Guards</p>
              <p className="text-xs text-slate-500">Express-Validator & BCrypt</p>
            </div>
          </div>

          {/* API Response Display */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs">
            <div className="text-slate-400 mb-2 flex items-center justify-between">
              <span>GET /api/health Telemetry Output:</span>
              <span className="text-[10px] text-slate-500">Automatic Interceptor Verification</span>
            </div>
            {health ? (
              <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(health, null, 2)}
              </pre>
            ) : error ? (
              <p className="text-rose-400">{error}</p>
            ) : (
              <p className="text-slate-600">No telemetry data recorded yet.</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        B.Tech Computer Science and Engineering — Smart Traffic Management System Coursework Project
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import {
  Activity,
  Bell,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  Shield,
  User as UserIcon,
  CheckCircle,
  AlertTriangle,
  Play,
} from 'lucide-react';

export default function Navbar({ onSimulateTick }) {
  const { user, logout, isAdmin, isPolice } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/alerts/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Suppress when unauthenticated
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSimulatePulse = async () => {
    setIsSimulating(true);
    try {
      await api.post('/traffic/simulate-tick');
      if (onSimulateTick) onSimulateTick();
      fetchNotifications();
    } catch (err) {
      console.error('Pulse error:', err);
    } finally {
      setTimeout(() => setIsSimulating(false), 600);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/alerts/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity & Telemetry Indicator */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Activity className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg">
                Smart Traffic System
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent Urban Grid & Adaptive Signals
            </p>
          </div>
        </div>

        {/* Right: Actions, Simulation Pulse, Notifications, Theme, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Simulation Pulse Button (for Police/Admin) */}
          {(isAdmin || isPolice) && (
            <button
              onClick={handleSimulatePulse}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
              title="Trigger simulated sensor pulse across all intersections"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Simulate Pulse</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      Notifications & Alerts
                    </span>
                    <span className="text-xs text-slate-500">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No new notifications
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => markAsRead(notif._id)}
                          className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                            notif.isRead
                              ? 'bg-slate-50 dark:bg-slate-850/50 text-slate-500'
                              : 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold">{notif.title}</span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-[11px] mt-1 opacity-90 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile & Role Pill */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user.name}
                </p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

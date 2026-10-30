import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Radio,
  AlertTriangle,
  BarChart3,
  Sliders,
  Users,
  Compass,
} from 'lucide-react';

export default function Sidebar() {
  const { isAdmin, isPolice, isCitizen } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Live Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'police', 'citizen'],
    },
    {
      to: '/map',
      label: 'Traffic Map',
      icon: Compass,
      roles: ['admin', 'police', 'citizen'],
    },
    {
      to: '/signals',
      label: 'Signal Controllers',
      icon: Radio,
      roles: ['admin', 'police'],
    },
    {
      to: '/incidents',
      label: 'Incidents & Alerts',
      icon: AlertTriangle,
      roles: ['admin', 'police', 'citizen'],
    },
    {
      to: '/intersections',
      label: 'Intersections',
      icon: MapPin,
      roles: ['admin', 'police'],
    },
    {
      to: '/analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      roles: ['admin', 'police'],
    },
    {
      to: '/users',
      label: 'User Directory',
      icon: Users,
      roles: ['admin'],
    },
    {
      to: '/settings',
      label: 'System Settings',
      icon: Sliders,
      roles: ['admin'],
    },
  ];

  const userRole = isAdmin ? 'admin' : isPolice ? 'police' : 'citizen';
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 flex-shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Modules
        </div>

        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Role Pill Banner in Sidebar */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
        <p className="font-semibold text-slate-700 dark:text-slate-300">Active Operator Role</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
          {isAdmin ? '👑 Global Administrator' : isPolice ? '👮 Traffic Control Officer' : '🚗 Citizen / Public User'}
        </p>
      </div>
    </aside>
  );
}

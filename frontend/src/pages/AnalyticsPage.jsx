import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Clock, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/analytics?days=${days}`);
      if (res.success) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  // Hourly trends or fallback mock for initial empty datasets
  const hourlyData = (analytics?.hourlyTrends && analytics.hourlyTrends.length > 0)
    ? analytics.hourlyTrends
    : [
        { hour: '06:00', avgDensity: 22, avgSpeed: 52, totalVehicles: 180 },
        { hour: '08:00', avgDensity: 68, avgSpeed: 28, totalVehicles: 740 },
        { hour: '10:00', avgDensity: 82, avgSpeed: 18, totalVehicles: 920 },
        { hour: '12:00', avgDensity: 45, avgSpeed: 42, totalVehicles: 510 },
        { hour: '14:00', avgDensity: 40, avgSpeed: 45, totalVehicles: 480 },
        { hour: '16:00', avgDensity: 58, avgSpeed: 34, totalVehicles: 660 },
        { hour: '18:00', avgDensity: 88, avgSpeed: 14, totalVehicles: 990 },
        { hour: '20:00', avgDensity: 74, avgSpeed: 22, totalVehicles: 810 },
        { hour: '22:00', avgDensity: 32, avgSpeed: 48, totalVehicles: 330 },
      ];

  const categoryData = (analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0)
    ? analytics.categoryBreakdown.map((c) => ({
        name: (c._id || 'low').toUpperCase(),
        records: c.count,
      }))
    : [
        { name: 'LOW', records: 42 },
        { name: 'MEDIUM', records: 58 },
        { name: 'HIGH', records: 26 },
        { name: 'SEVERE', records: 12 },
      ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <span>Traffic Reports & Analytics Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical congestion frequencies, rush hour velocity trends, and incident metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
            {[
              { val: 1, label: '24 Hours' },
              { val: 7, label: '7 Days' },
              { val: 30, label: '30 Days' },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setDays(tab.val)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  days === tab.val
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Chart: Density vs Speed Correlation */}
      <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Congestion Saturation vs Average Speed (km/h)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Correlating rush hour density spikes with transit velocity slowdowns
            </p>
          </div>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="hour" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="avgDensity"
                name="Traffic Density (%)"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorDensity)"
              />
              <Area
                type="monotone"
                dataKey="avgSpeed"
                name="Average Velocity (km/h)"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorSpeed)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Vehicular Volume Bar Chart + Congestion Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicular Volume Bar Chart */}
        <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Vehicular Volume by Time Slot</span>
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated sensor count across all active intersections
            </p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="hour" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="totalVehicles" name="Vehicles Ingested" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Congestion Level Distribution */}
        <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Congestion Category Frequency Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of telemetry samples categorized by threshold
            </p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="records" name="Record Count" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

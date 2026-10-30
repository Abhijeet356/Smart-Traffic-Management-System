import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import DensityBadge from '../components/common/DensityBadge';
import TrafficMap from '../components/map/TrafficMap';
import IncidentReportModal from '../components/incidents/IncidentReportModal';
import {
  MapPin,
  Car,
  Activity,
  AlertTriangle,
  Radio,
  Clock,
  ArrowUpRight,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isPolice, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [liveTraffic, setLiveTraffic] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsRes, trafficRes, alertsRes] = await Promise.all([
        api.get('/reports/dashboard-stats'),
        api.get('/traffic/live'),
        api.get('/alerts?status=new&limit=5'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (trafficRes.success) setLiveTraffic(trafficRes.data || []);
      if (alertsRes.success) setActiveAlerts(alertsRes.alerts || []);
    } catch (err) {
      console.error('[Dashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Auto refresh telemetry every 8 seconds
    const interval = setInterval(loadDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Command Center Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time urban telemetry, adaptive signal coordination, and incident dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Hazard</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Intersections"
          value={stats?.totalLocations || 0}
          subtitle={`${stats?.totalSignals || 0} Adaptive Signals Online`}
          icon={MapPin}
          color="emerald"
        />

        <StatCard
          title="Detected Vehicles (24h)"
          value={(stats?.totalVehicles24h || 0).toLocaleString()}
          subtitle={`Avg Speed: ${stats?.avgSpeed24h || 45} km/h`}
          icon={Car}
          color="blue"
        />

        <StatCard
          title="City Saturation Index"
          value={`${stats?.avgDensity24h || 0}%`}
          subtitle={`${stats?.congestedLocationsCount || 0} Intersections Congested`}
          icon={Activity}
          color={
            (stats?.avgDensity24h || 0) > 70
              ? 'rose'
              : (stats?.avgDensity24h || 0) > 50
              ? 'amber'
              : 'emerald'
          }
        />

        <StatCard
          title="Active Alerts & Hazards"
          value={stats?.activeAlerts || 0}
          subtitle={`${stats?.activeIncidents || 0} Incidents Logged`}
          icon={AlertTriangle}
          color={stats?.activeAlerts > 0 ? 'rose' : 'purple'}
        />
      </div>

      {/* Grid: Live Map Visualizer + Active Emergency Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View (2 columns on large screen) */}
        <div className="lg:col-span-2 glass-card p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[460px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Metropolitan Traffic Grid Visualizer</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h2>
              <p className="text-xs text-slate-500">
                Interactive OpenStreetMap pins with real-time density saturation levels
              </p>
            </div>
            <a
              href="/map"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Full Screen</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex-1 w-full relative">
            <TrafficMap locations={liveTraffic} />
          </div>
        </div>

        {/* Live Alerts & Hazards Feed */}
        <div className="glass-card p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[460px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Priority Alerts Ticker</span>
            </h2>
            <span className="text-xs font-bold text-rose-500">
              {activeAlerts.length} Active
            </span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Normal Traffic Flow
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  No critical bottlenecks or road closures currently detected.
                </p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {alert.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    {alert.message}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monitored Intersections Telemetry Table */}
      <div className="glass-card p-5 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Live Intersections & Road Segments
            </h2>
            <p className="text-xs text-slate-500">
              Live capacity utilization, vehicle counts, and active signal cycle allocations
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">Intersection</th>
                <th className="pb-3">Road Code</th>
                <th className="pb-3">Vehicle Count</th>
                <th className="pb-3">Density Saturation</th>
                <th className="pb-3">Avg Speed</th>
                <th className="pb-3">Signal State</th>
                <th className="pb-3 pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {liveTraffic.map((item) => {
                const loc = item.location;
                const telemetry = item.telemetry || {};
                const signal = item.signal || {};

                return (
                  <tr key={loc._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white">
                      {loc.name}
                    </td>
                    <td className="py-3 font-mono font-semibold text-slate-500">
                      {loc.code}
                    </td>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {telemetry.vehicleCount || 0} / {loc.roadCapacity}
                    </td>
                    <td className="py-3">
                      <DensityBadge
                        level={telemetry.congestionLevel}
                        percentage={telemetry.densityPercentage}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">{telemetry.averageSpeed || loc.speedLimit}</span> km/h
                      <span className="text-[10px] text-slate-400 block">Limit: {loc.speedLimit} km/h</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {signal.mode || 'Adaptive'}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Reporting Modal */}
      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        locations={liveTraffic}
        onIncidentReported={() => loadDashboardData()}
      />
    </div>
  );
}

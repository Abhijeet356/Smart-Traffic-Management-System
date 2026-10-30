import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import IncidentReportModal from '../components/incidents/IncidentReportModal';
import {
  AlertTriangle,
  PlusCircle,
  CheckCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function IncidentsPage() {
  const { isPolice, isAdmin } = useAuth();

  const [incidents, setIncidents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIncidentsAndLocations = async () => {
    try {
      const [incRes, locRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/locations'),
      ]);

      if (incRes.success) setIncidents(incRes.incidents || []);
      if (locRes.success) setLocations(locRes.locations || []);
    } catch (err) {
      console.error('Fetch incidents error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsAndLocations();
  }, []);

  const handleUpdateStatus = async (incidentId, newStatus) => {
    try {
      const res = await api.put(`/incidents/${incidentId}/status`, {
        status: newStatus,
        resolutionNotes: newStatus === 'resolved' ? 'Cleared by traffic patrol officer' : '',
      });

      if (res.success) {
        setIncidents((prev) =>
          prev.map((inc) => (inc._id === incidentId ? res.incident : inc))
        );
      }
    } catch (err) {
      console.error('Update incident status error:', err);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter === 'all') return true;
    return inc.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Incidents & Road Hazards Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Crowdsourced and sensor-flagged traffic incidents, accidents, bottlenecks, and dispatch tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>

          <button
            onClick={fetchIncidentsAndLocations}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit text-xs font-semibold">
        {['all', 'reported', 'verified', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
              statusFilter === st
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Incidents Table */}
      <div className="glass-card p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">Incident / Hazard</th>
                <th className="pb-3">Intersection</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Reported Via</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Status</th>
                {(isPolice || isAdmin) && <th className="pb-3 pr-2 text-right">Officer Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No incidents matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 pl-2">
                      <span className="font-bold text-slate-900 dark:text-white capitalize block">
                        {inc.type}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {inc.description}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {inc.locationId?.name || 'Unknown Location'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inc.severity === 'critical'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : inc.severity === 'high'
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 capitalize">
                      {inc.detectedVia?.replace('_', ' ')}
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(inc.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          inc.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : inc.status === 'verified'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    {(isPolice || isAdmin) && (
                      <td className="py-3 pr-2 text-right space-x-1.5">
                        {inc.status === 'reported' && (
                          <button
                            onClick={() => handleUpdateStatus(inc._id, 'verified')}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold"
                          >
                            Verify
                          </button>
                        )}
                        {inc.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(inc._id, 'resolved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <IncidentReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locations={locations}
        onIncidentReported={fetchIncidentsAndLocations}
      />
    </div>
  );
}

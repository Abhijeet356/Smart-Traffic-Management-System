import React, { useState } from 'react';
import api from '../../services/api';
import { AlertTriangle, X, Check } from 'lucide-react';

export default function IncidentReportModal({ isOpen, onClose, locations = [], onIncidentReported }) {
  if (!isOpen) return null;

  const [locationId, setLocationId] = useState(locations[0]?._id || '');
  const [type, setType] = useState('accident');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of the incident.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/incidents', {
        locationId: locationId || locations[0]?._id,
        type,
        severity,
        description,
      });

      if (res.success) {
        if (onIncidentReported) onIncidentReported(res.incident);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit incident report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Report Traffic Incident
            </h3>
            <p className="text-xs text-slate-500">
              Crowdsourced notification dispatched immediately to traffic control room
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Intersection / Location
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {locations.map((loc) => {
                const item = loc.location || loc;
                return (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.code})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Incident Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none capitalize"
              >
                <option value="accident">Road Accident</option>
                <option value="obstruction">Road Obstruction / Debris</option>
                <option value="congestion">Unusual Severe Jam</option>
                <option value="violation">Traffic Rule Violation</option>
                <option value="other">Other Hazard</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none capitalize"
              >
                <option value="low">Low (Minor Delay)</option>
                <option value="medium">Medium (Lane Blocked)</option>
                <option value="high">High (Major Bottleneck)</option>
                <option value="critical">Critical (Complete Standstill)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Landmarks
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Overturned commercial truck blocking two northbound lanes near hospital exit..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

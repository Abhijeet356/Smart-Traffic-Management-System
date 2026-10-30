import React, { useState } from 'react';
import api from '../../services/api';
import { ShieldAlert, X, Check, Siren } from 'lucide-react';

export default function ManualOverrideModal({ isOpen, onClose, signal, onOverrideSuccess }) {
  if (!isOpen || !signal) return null;

  const [greenDirection, setGreenDirection] = useState('North');
  const [greenDuration, setGreenDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleOverride = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.put(`/signals/${signal._id}/override`, {
        greenDirection,
        greenDuration: parseInt(greenDuration),
        mode: 'manual',
      });

      if (res.success) {
        if (onOverrideSuccess) onOverrideSuccess(res.signal);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to apply manual preemption');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Siren className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Signal Preemption / Override
            </h3>
            <p className="text-xs text-slate-500">
              {signal.intersectionName}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleOverride} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Priority Green Direction (Corridor)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['North', 'South', 'East', 'West'].map((dir) => (
                <button
                  type="button"
                  key={dir}
                  onClick={() => setGreenDirection(dir)}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    greenDirection === dir
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
                  }`}
                >
                  {dir} Bound
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Extended Green Window Duration: <span className="text-emerald-500 font-bold">{greenDuration}s</span>
            </label>
            <input
              type="range"
              min={20}
              max={120}
              step={5}
              value={greenDuration}
              onChange={(e) => setGreenDuration(e.target.value)}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>20s (Quick clear)</span>
              <span>60s (Standard corridor)</span>
              <span>120s (Extended convoy)</span>
            </div>
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
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Applying...' : 'Enforce Preemption'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

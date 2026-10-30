import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sliders, CheckCircle2, Shield, Settings2, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    lowDensityMax: 30,
    mediumDensityMax: 60,
    highDensityMax: 80,
    simulationIntervalMs: 10000,
    autoSimulation: true,
    autoOptimization: true,
    emergencyPreemption: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.put('/settings', settings);
      if (res.success) {
        setSuccessMsg('System configuration and algorithm thresholds saved successfully.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-emerald-500" />
          <span>System Settings & Algorithmic Parameters</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tune classification threshold cutoffs, automated sensor generation intervals, and preemption policies
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Density Thresholds Card */}
        <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Traffic Density Category Thresholds (%)
            </h2>
            <p className="text-xs text-slate-500">
              Formulas: (Vehicles / Road Capacity) * 100
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Low Traffic Ceiling (&le; %)
              </label>
              <input
                type="number"
                min={10}
                max={45}
                value={settings.lowDensityMax}
                onChange={(e) => setSettings({ ...settings, lowDensityMax: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default: 30%</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Medium Traffic Ceiling (&le; %)
              </label>
              <input
                type="number"
                min={35}
                max={75}
                value={settings.mediumDensityMax}
                onChange={(e) => setSettings({ ...settings, mediumDensityMax: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Default: 60%</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                High Traffic Ceiling (&le; %)
              </label>
              <input
                type="number"
                min={65}
                max={90}
                value={settings.highDensityMax}
                onChange={(e) => setSettings({ ...settings, highDensityMax: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Above this = Severe (Default: 80%)</span>
            </div>
          </div>
        </div>

        {/* Engine Automation Toggles */}
        <div className="glass-card p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Automation & Signal Adaptation Features
            </h2>
            <p className="text-xs text-slate-500">
              Control dynamic Webster calculations and telemetry ingestion
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Adaptive Signal Timing Auto-Optimization
                </span>
                <span className="text-[11px] text-slate-500">
                  Automatically calculates proportional green splits whenever density shifts
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoOptimization}
                onChange={(e) => setSettings({ ...settings, autoOptimization: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Automated Sensor Simulator Background Worker
                </span>
                <span className="text-[11px] text-slate-500">
                  Continuously generates realistic peak/off-peak vehicle influx telemetry
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSimulation}
                onChange={(e) => setSettings({ ...settings, autoSimulation: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Emergency Preemption Authorization
                </span>
                <span className="text-[11px] text-slate-500">
                  Enables police patrol operators to trigger immediate green corridors for ambulances
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.emergencyPreemption}
                onChange={(e) => setSettings({ ...settings, emergencyPreemption: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Configuration Parameters'}</span>
        </button>
      </form>
    </div>
  );
}

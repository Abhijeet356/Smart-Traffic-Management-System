import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SignalLightWidget from '../components/signals/SignalLightWidget';
import ManualOverrideModal from '../components/signals/ManualOverrideModal';
import { Radio, Zap, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SignalsPage() {
  const { isPolice, isAdmin } = useAuth();

  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overrideSignal, setOverrideSignal] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState(null);

  const fetchSignals = async () => {
    try {
      const res = await api.get('/signals');
      if (res.success) {
        setSignals(res.signals || []);
      }
    } catch (err) {
      console.error('Fetch signals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOptimize = async (sig) => {
    try {
      const res = await api.post(`/signals/${sig._id}/optimize`);
      if (res.success) {
        setNotificationMsg(`Dynamic Webster optimization applied to ${sig.intersectionName}`);
        fetchSignals();
        setTimeout(() => setNotificationMsg(null), 4000);
      }
    } catch (err) {
      console.error('Optimize error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-500" />
            <span>Adaptive Traffic Signal Controllers</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-phase cycle management, Webster green-split optimization, and emergency corridor overrides
          </p>
        </div>

        <button
          onClick={fetchSignals}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Signals</span>
        </button>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Grid of Intersection Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {signals.map((signal) => (
          <SignalLightWidget
            key={signal._id}
            signal={signal}
            canControl={isPolice || isAdmin}
            onOptimize={handleOptimize}
            onOverride={(sig) => setOverrideSignal(sig)}
          />
        ))}
      </div>

      {/* Manual Override Modal */}
      <ManualOverrideModal
        isOpen={!!overrideSignal}
        signal={overrideSignal}
        onClose={() => setOverrideSignal(null)}
        onOverrideSuccess={(updatedSignal) => {
          setNotificationMsg(`Manual preemption green corridor enforced for ${updatedSignal.intersectionName}`);
          fetchSignals();
          setTimeout(() => setNotificationMsg(null), 4000);
        }}
      />
    </div>
  );
}

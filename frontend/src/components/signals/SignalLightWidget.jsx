import React from 'react';
import { SlidersHorizontal, Zap, ShieldAlert } from 'lucide-react';

export default function SignalLightWidget({ signal, onOptimize, onOverride, canControl = false }) {
  if (!signal) return null;

  const arms = signal.arms || [];

  return (
    <div className="glass-card p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {signal.locationId?.code || 'INT'}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            {signal.intersectionName}
          </h3>
          <p className="text-xs text-slate-500">
            Cycle Time: <span className="font-semibold">{signal.cycleDuration}s</span> | Status: <span className="capitalize font-semibold text-emerald-500">{signal.status}</span>
          </p>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
          signal.mode === 'adaptive'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        }`}>
          {signal.mode}
        </span>
      </div>

      {/* 4 Directional Arms Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {arms.map((arm, idx) => {
          const isGreen = arm.currentLight === 'green';
          const isYellow = arm.currentLight === 'yellow';
          const isRed = arm.currentLight === 'red';

          return (
            <div
              key={arm._id || idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex flex-col items-center text-center"
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {arm.direction}
              </span>

              {/* Physical Signal Housing */}
              <div className="w-9 py-2 my-2 bg-slate-950 rounded-full flex flex-col items-center gap-1.5 shadow-inner border border-slate-800">
                {/* Red light */}
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    isRed
                      ? 'bg-rose-500 shadow-lg shadow-rose-500/80 ring-2 ring-rose-400'
                      : 'bg-rose-950/40 opacity-40'
                  }`}
                />
                {/* Yellow light */}
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    isYellow
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/80 ring-2 ring-amber-300'
                      : 'bg-amber-950/40 opacity-40'
                  }`}
                />
                {/* Green light */}
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    isGreen
                      ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80 ring-2 ring-emerald-300 animate-pulse'
                      : 'bg-emerald-950/40 opacity-40'
                  }`}
                />
              </div>

              <div className="text-[11px] text-slate-500">
                Green: <span className="font-bold text-slate-900 dark:text-white">{arm.greenDuration}s</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Actions for Police / Admin */}
      {canControl && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
          <button
            onClick={() => onOptimize && onOptimize(signal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors border border-emerald-500/30"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Optimize Splits</span>
          </button>

          <button
            onClick={() => onOverride && onOverride(signal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-colors border border-amber-500/30"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Manual Preemption</span>
          </button>
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function DensityBadge({ level, percentage = null, size = 'md' }) {
  const normalizedLevel = (level || 'low').toLowerCase();

  const configs = {
    low: {
      label: 'Low Traffic',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    medium: {
      label: 'Medium Traffic',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
    },
    high: {
      label: 'High Traffic',
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-500/30',
      dot: 'bg-orange-500',
    },
    severe: {
      label: 'Severe Congestion',
      bg: 'bg-rose-500/10 dark:bg-rose-500/20',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
      dot: 'bg-rose-500 animate-pulse',
    },
  };

  const config = configs[normalizedLevel] || configs.low;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <span>{config.label}</span>
      {percentage !== null && (
        <span className="font-bold opacity-90">({percentage}%)</span>
      )}
    </span>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TrafficMap from '../components/map/TrafficMap';
import DensityBadge from '../components/common/DensityBadge';
import { Filter, Layers, RefreshCw, Compass } from 'lucide-react';

export default function LiveMapPage() {
  const [trafficData, setTrafficData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filterLevel, setFilterLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchTraffic = async () => {
    try {
      const res = await api.get('/traffic/live');
      if (res.success) {
        setTrafficData(res.data || []);
      }
    } catch (err) {
      console.error('Fetch map traffic error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredLocations = trafficData.filter((item) => {
    if (filterLevel === 'all') return true;
    const level = (item.telemetry?.congestionLevel || 'low').toLowerCase();
    return level === filterLevel;
  });

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" />
            <span>Interactive Geographic Traffic Grid</span>
          </h1>
          <p className="text-xs text-slate-500">
            Visualizing real-time road conditions across the metropolitan road network
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {['all', 'low', 'medium', 'high', 'severe'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                  filterLevel === lvl
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={fetchTraffic}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 w-full rounded-2xl overflow-hidden relative shadow-lg">
        <TrafficMap
          locations={filteredLocations}
          onSelectLocation={(loc) => setSelectedLocation(loc)}
        />
      </div>
    </div>
  );
}

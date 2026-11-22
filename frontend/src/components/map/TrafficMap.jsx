import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import DensityBadge from '../common/DensityBadge';
import { MapPin, Navigation, Eye } from 'lucide-react';

export const CITIES = {
  patna: {
    name: 'Patna (Bihar)',
    center: [25.6120, 85.1350],
    zoom: 13,
  },
  delhi: {
    name: 'Delhi NCR',
    center: [28.6139, 77.2090],
    zoom: 12,
  },
  mumbai: {
    name: 'Mumbai (Maharashtra)',
    center: [19.0760, 72.8777],
    zoom: 12,
  },
  bengaluru: {
    name: 'Bengaluru (Karnataka)',
    center: [12.9716, 77.5946],
    zoom: 12,
  },
  kolkata: {
    name: 'Kolkata (West Bengal)',
    center: [22.5726, 88.3639],
    zoom: 12,
  },
};

// Sub-component to smoothly re-center leaflet map when city selection changes
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function TrafficMap({ locations = [], onSelectLocation, initialCity = 'patna' }) {
  const [selectedCityKey, setSelectedCityKey] = useState(initialCity);

  const activeCity = CITIES[selectedCityKey] || CITIES.patna;

  const getColorByLevel = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'severe':
        return '#dc2626'; // Red
      case 'high':
        return '#ea580c'; // Orange
      case 'medium':
        return '#d97706'; // Amber / Yellow
      case 'low':
      default:
        return '#059669'; // Emerald Green
    }
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-0 flex flex-col bg-slate-50 dark:bg-slate-900 shadow-sm">
      {/* Real-world State / City Control Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Region:</span>
        </div>

        <select
          value={selectedCityKey}
          onChange={(e) => setSelectedCityKey(e.target.value)}
          className="text-xs font-medium py-1 px-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          {Object.entries(CITIES).map(([key, city]) => (
            <option key={key} value={key}>
              {city.name}
            </option>
          ))}
        </select>

        <span className="text-[11px] font-mono text-slate-500 border-l border-slate-300 dark:border-slate-700 pl-2">
          {(() => {
            const count = locations.filter(loc => {
              const c = (loc.city || '').toLowerCase();
              const code = (loc.code || '').toLowerCase();
              if (selectedCityKey === 'patna') return c.includes('patna') || code.startsWith('pat');
              if (selectedCityKey === 'delhi') return c.includes('delhi') || code.startsWith('del');
              return true;
            }).length;
            return count > 0 ? `${count} Intersections in ${activeCity.name.split(' ')[0]}` : `${locations.length} Total Intersections`;
          })()}
        </span>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm text-[11px]">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600 dark:text-slate-300">Low (0-30%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600 dark:text-slate-300">Med (31-60%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="text-slate-600 dark:text-slate-300">High (61-80%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span className="text-slate-600 dark:text-slate-300">Severe (81-100%)</span>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={activeCity.center}
        zoom={activeCity.zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapViewUpdater center={activeCity.center} zoom={activeCity.zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {locations.map((item) => {
          const loc = item.location || item;
          const telemetry = item.telemetry || {};
          const lat = loc.coordinates?.latitude;
          const lng = loc.coordinates?.longitude;

          if (!lat || !lng) return null;

          const level = telemetry.congestionLevel || 'low';
          const markerColor = getColorByLevel(level);

          return (
            <CircleMarker
              key={loc._id || loc.code}
              center={[lat, lng]}
              radius={level === 'severe' ? 14 : 11}
              pathOptions={{
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-xs font-semibold text-slate-900">
                  {loc.name} ({loc.code})
                </div>
                <div className="text-[11px] text-slate-600">
                  Density: {telemetry.densityPercentage || 0}% | {telemetry.vehicleCount || 0} veh
                </div>
              </Tooltip>

              <Popup>
                <div className="p-1 min-w-[210px] text-slate-900 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-bold text-sm text-slate-800">{loc.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {loc.code}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Status:</span>
                      <DensityBadge
                        level={level}
                        percentage={telemetry.densityPercentage || 0}
                        size="sm"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicles:</span>
                      <span className="font-medium">{telemetry.vehicleCount || 0} veh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg Speed:</span>
                      <span className="font-medium">{telemetry.averageSpeed || loc.speedLimit} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Road Capacity:</span>
                      <span>{loc.roadCapacity} veh/hr</span>
                    </div>
                  </div>

                  {onSelectLocation && (
                    <button
                      onClick={() => onSelectLocation(loc)}
                      className="mt-3 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage Signal</span>
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

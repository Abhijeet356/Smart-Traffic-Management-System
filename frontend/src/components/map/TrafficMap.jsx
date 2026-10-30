import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import DensityBadge from '../common/DensityBadge';

export default function TrafficMap({ locations = [], onSelectLocation }) {
  // Default coordinates centered on New Delhi NCR
  const defaultCenter = [28.6139, 77.2090];
  const zoomLevel = 12;

  const getColorByLevel = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'severe':
        return '#EF4444'; // Red
      case 'high':
        return '#F97316'; // Orange
      case 'medium':
        return '#F59E0B'; // Amber
      case 'low':
      default:
        return '#10B981'; // Emerald Green
    }
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              key={loc._id}
              center={[lat, lng]}
              radius={level === 'severe' ? 16 : 13}
              pathOptions={{
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.8,
                weight: 3,
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
                <div className="p-1 min-w-[200px] text-slate-900">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="font-bold text-sm">{loc.name}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100">
                      {loc.code}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Congestion:</span>
                      <DensityBadge
                        level={level}
                        percentage={telemetry.densityPercentage || 0}
                        size="sm"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicles Count:</span>
                      <span className="font-semibold">{telemetry.vehicleCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Average Velocity:</span>
                      <span className="font-semibold">{telemetry.averageSpeed || loc.speedLimit} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Road Capacity:</span>
                      <span>{loc.roadCapacity} veh/hr</span>
                    </div>
                  </div>

                  {onSelectLocation && (
                    <button
                      onClick={() => onSelectLocation(loc)}
                      className="mt-3 w-full py-1.5 px-3 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      View Details & Control
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

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, Trash2, Edit3, X, Check, RefreshCw, Compass } from 'lucide-react';

const CITY_PRESETS = [
  { name: 'Patna (Bihar)', lat: '25.6093', lng: '85.1235', codePrefix: 'PAT' },
  { name: 'Delhi NCR', lat: '28.6139', lng: '77.2090', codePrefix: 'DEL' },
  { name: 'Mumbai (MH)', lat: '19.0760', lng: '72.8777', codePrefix: 'MUM' },
  { name: 'Bengaluru (KA)', lat: '12.9716', lng: '77.5946', codePrefix: 'BLR' },
  { name: 'Kolkata (WB)', lat: '22.5726', lng: '88.3639', codePrefix: 'KOL' },
];

export default function IntersectionsPage() {
  const { isAdmin } = useAuth();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    latitude: '25.6093',
    longitude: '85.1235',
    roadCapacity: 800,
    speedLimit: 50,
    roadType: 'intersection',
    description: '',
  });

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      if (res.success) {
        setLocations(res.locations || []);
      }
    } catch (err) {
      console.error('Fetch locations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreateModal = () => {
    setEditingLoc(null);
    setFormData({
      name: '',
      code: '',
      latitude: '25.6093',
      longitude: '85.1235',
      roadCapacity: 800,
      speedLimit: 50,
      roadType: 'intersection',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditingLoc(loc);
    setFormData({
      name: loc.name,
      code: loc.code,
      latitude: loc.coordinates?.latitude || '',
      longitude: loc.coordinates?.longitude || '',
      roadCapacity: loc.roadCapacity,
      speedLimit: loc.speedLimit,
      roadType: loc.roadType,
      description: loc.description || '',
    });
    setIsModalOpen(true);
  };

  const applyPreset = (preset) => {
    const nextNum = locations.length + 101;
    setFormData((prev) => ({
      ...prev,
      latitude: preset.lat,
      longitude: preset.lng,
      code: prev.code || `${preset.codePrefix}-${nextNum}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        coordinates: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        roadCapacity: parseInt(formData.roadCapacity),
        speedLimit: parseInt(formData.speedLimit),
        roadType: formData.roadType,
        description: formData.description,
      };

      if (editingLoc) {
        await api.put(`/locations/${editingLoc._id}`, payload);
      } else {
        await api.post('/locations', payload);
      }

      setIsModalOpen(false);
      fetchLocations();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this monitored intersection?')) return;
    try {
      await api.delete(`/locations/${id}`);
      fetchLocations();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Monitored Intersections Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage traffic nodes, coordinates, speed limits, and sensor capacities across any city or state.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Intersection</span>
            </button>
          )}

          <button
            onClick={fetchLocations}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Intersections Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Name & Description</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Coordinates (Lat, Lng)</th>
                <th className="py-3 px-4">Road Type</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Speed Limit</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {locations.map((loc) => (
                <tr key={loc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {loc.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {loc.description || 'Monitored grid intersection'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {loc.code}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {loc.coordinates?.latitude?.toFixed(4)}, {loc.coordinates?.longitude?.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-300">
                    {loc.roadType}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {loc.roadCapacity} veh/hr
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {loc.speedLimit} km/h
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Intersection"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc._id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Intersection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Location */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-5 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-2.5 border-b border-slate-200 dark:border-slate-800">
              {editingLoc ? 'Edit Intersection Settings' : 'Register New Monitored Intersection'}
            </h3>

            {/* City Preset Quick Helper */}
            {!editingLoc && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  Click a city to autofill coordinates for any state:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CITY_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Intersection / Junction Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kankarbagh Main Road / Marine Drive"
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Unique Code
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingLoc}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="PAT-106"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Road Type
                  </label>
                  <select
                    value={formData.roadType}
                    onChange={(e) => setFormData({ ...formData, roadType: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="intersection">Intersection</option>
                    <option value="roundabout">Roundabout</option>
                    <option value="arterial_road">Arterial Road</option>
                    <option value="expressway">Expressway</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Road Capacity (Veh/hr)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.roadCapacity}
                    onChange={(e) => setFormData({ ...formData, roadCapacity: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Speed Limit (km/h)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.speedLimit}
                    onChange={(e) => setFormData({ ...formData, speedLimit: e.target.value })}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key corridor or transit details..."
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Intersection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

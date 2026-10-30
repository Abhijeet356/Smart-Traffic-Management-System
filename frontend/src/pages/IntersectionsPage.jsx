import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, Trash2, Edit3, X, Check, RefreshCw } from 'lucide-react';

export default function IntersectionsPage() {
  const { isAdmin } = useAuth();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    latitude: '',
    longitude: '',
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
      latitude: '28.6139',
      longitude: '77.2090',
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-500" />
            <span>Monitored Intersections & Road Network</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure junction geometry, vehicular throughput capacity limits, and traffic speed baselines
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Intersection</span>
            </button>
          )}

          <button
            onClick={fetchLocations}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Intersections Table */}
      <div className="glass-card p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">Name & Description</th>
                <th className="pb-3">Code</th>
                <th className="pb-3">Coordinates (Lat, Lng)</th>
                <th className="pb-3">Road Type</th>
                <th className="pb-3">Capacity (Veh/hr)</th>
                <th className="pb-3">Speed Limit</th>
                {isAdmin && <th className="pb-3 pr-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {locations.map((loc) => (
                <tr key={loc._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 pl-2">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {loc.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {loc.description || 'Monitored grid intersection'}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {loc.code}
                  </td>
                  <td className="py-3 font-mono text-slate-600 dark:text-slate-300">
                    {loc.coordinates?.latitude?.toFixed(4)}, {loc.coordinates?.longitude?.toFixed(4)}
                  </td>
                  <td className="py-3 capitalize text-slate-600 dark:text-slate-300">
                    {loc.roadType}
                  </td>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {loc.roadCapacity}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">
                    {loc.speedLimit} km/h
                  </td>
                  {isAdmin && (
                    <td className="py-3 pr-2 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Intersection"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              {editingLoc ? 'Edit Intersection Settings' : 'Register New Monitored Intersection'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Intersection Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lajpat Nagar Ring Road"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unique Code
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingLoc}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="INT-106"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Road Type
                  </label>
                  <select
                    value={formData.roadType}
                    onChange={(e) => setFormData({ ...formData, roadType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Road Capacity (Veh/hr)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.roadCapacity}
                    onChange={(e) => setFormData({ ...formData, roadCapacity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Speed Limit (km/h)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.speedLimit}
                    onChange={(e) => setFormData({ ...formData, speedLimit: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key corridor details..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
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

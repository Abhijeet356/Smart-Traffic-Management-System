import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, UserCheck, UserX, Search, RefreshCw } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/users/${userId}/role`, { role: newRole });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/status`);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.user.isActive } : u))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-500" />
            <span>User Management & Role Access Control</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global administrative control over police operators, staff permissions, and citizen registries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by name, email, or badge..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-semibold">
          <span className="text-slate-500">Filter Role:</span>
          {['', 'admin', 'police', 'citizen'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                roleFilter === r
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">User Details</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Badge / Phone</th>
                <th className="pb-3">System Role</th>
                <th className="pb-3">Account Status</th>
                <th className="pb-3 pr-2 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id;

                return (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 pl-2">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {u.name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] text-emerald-500 font-semibold">
                          (Your Active Session)
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-3 text-slate-500">
                      {u.badgeNumber ? (
                        <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                          {u.badgeNumber}
                        </span>
                      ) : (
                        u.contactNumber || '—'
                      )}
                    </td>
                    <td className="py-3">
                      <select
                        disabled={isSelf}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold capitalize outline-none disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="police">Police</option>
                        <option value="citizen">Citizen</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.isActive
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

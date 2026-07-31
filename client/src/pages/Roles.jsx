import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, UserCheck } from 'lucide-react';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Cashier');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ]);

      if (rolesRes.success) setRoles(rolesRes.data);
      if (permRes.success) setPermissions(permRes.data);
    } catch (err) {
      console.error('Failed to fetch role data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!targetUserId) return;
    setMessage(null);

    try {
      const res = await api.post(`/users/${targetUserId}/assign-role`, { role: selectedRole });
      if (res.success) {
        setMessage({ type: 'success', text: `Role '${selectedRole}' assigned to User ID #${targetUserId} successfully!` });
        setTargetUserId('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to assign role' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-600 font-semibold">
        <span>Loading Role & Security Permissions...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Columns: Roles List & Permissions Matrix */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">System Roles & Granular Permissions</h3>
            <p className="text-xs text-slate-500">RBAC security matrix across 5 enterprise roles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">{role.name} Role</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {role.permissions?.length || 0} Permissions
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {role.permissions?.map((p) => (
                  <span
                    key={p.id}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-mono"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Assign Role Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Assign Role to Staff</h3>
            <p className="text-xs text-slate-500">Grant operational permissions</p>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleAssignRole} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">User ID</label>
            <input
              type="number"
              required
              placeholder="e.g. 3"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Role to Assign</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none"
            >
              {['Admin', 'Manager', 'Cashier', 'Waiter', 'Kitchen'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            Assign Role Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Roles;

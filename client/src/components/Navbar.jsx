import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Wifi } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* System Health Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Wifi className="w-3.5 h-3.5" />
          <span>API Connected</span>
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition cursor-pointer">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Info */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-900">{user?.name}</p>
          <p className="text-[11px] text-slate-500">{user?.email}</p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

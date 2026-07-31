import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid,
  SquareStack,
  ClipboardList,
  CreditCard,
  Boxes,
  ShieldCheck,
  LogOut,
  Sparkles,
  QrCode,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, role: 'all' },
    { name: 'POS & Floor Plan', path: '/pos', icon: Grid, role: 'all' },
    { name: 'Order Pipeline', path: '/orders', icon: ClipboardList, role: 'all' },
    { name: 'Payments', path: '/payments', icon: CreditCard, role: 'all' },
    { name: 'Table & QR Codes', path: '/restaurant-tables', icon: QrCode, role: 'Manager' },
    { name: 'Menu Catalog', path: '/menus', icon: UtensilsCrossed, role: 'Manager' },
    { name: 'Categories', path: '/categories', icon: SquareStack, role: 'Manager' },
    { name: 'Inventory', path: '/inventory', icon: Boxes, role: 'Manager' },
    { name: 'Roles & Staff', path: '/roles', icon: ShieldCheck, role: 'Admin' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              RestoFlow
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
              Enterprise v1.0
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded-full">
              {user?.roles?.[0] || 'User'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {navigation.map((item) => {
            if (item.role !== 'all' && !hasRole(item.role)) return null;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

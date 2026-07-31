import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Executive Analytics Dashboard';
      case '/pos':
        return 'POS & Floor Plan Manager';
      case '/orders':
        return 'Kitchen & Live Order Pipeline';
      case '/payments':
        return 'Cashier Billing & Payments';
      case '/restaurant-tables':
        return 'Table & QR Code Management';
      case '/menus':
        return 'Menu Catalog Management';
      case '/categories':
        return 'Category Management';
      case '/inventory':
        return 'Inventory & Stock Tracker';
      case '/roles':
        return 'Role & Staff Permissions';
      default:
        return 'RestoFlow Management';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={getPageTitle(location.pathname)} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pos from './pages/Pos';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Categories from './pages/Categories';
import Menus from './pages/Menus';
import Inventory from './pages/Inventory';
import Roles from './pages/Roles';
import TableManagement from './pages/TableManagement';
import CustomerOrder from './pages/CustomerOrder';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & QR Code Self-Order Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/table/:tableNumber" element={<CustomerOrder />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<Pos />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/payments" element={<Payments />} />

              {/* Role Restricted Routes */}
              <Route element={<ProtectedRoute role="Manager" />}>
                <Route path="/restaurant-tables" element={<TableManagement />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/menus" element={<Menus />} />
                <Route path="/inventory" element={<Inventory />} />
              </Route>

              <Route element={<ProtectedRoute role="Admin" />}>
                <Route path="/roles" element={<Roles />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

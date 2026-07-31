import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Grid, Plus, QrCode, Printer, Users, ExternalLink, Trash2 } from 'lucide-react';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQrTable, setSelectedQrTable] = useState(null);

  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 4,
    status: 'available',
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.get('/restaurant-tables?per_page=100');
      if (res.success) {
        setTables(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/restaurant-tables', formData);
      setShowAddModal(false);
      setFormData({ table_number: '', capacity: 4, status: 'available' });
      fetchTables();
    } catch (err) {
      alert(err.message || 'Failed to add table');
    }
  };

  const handleDeleteTable = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await api.delete(`/restaurant-tables/${id}`);
      fetchTables();
    } catch (err) {
      alert(err.message || 'Failed to delete table');
    }
  };

  const getQrUrl = (tableNumber) => {
    const targetUrl = `${window.location.origin}/table/${tableNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}`;
  };

  const getDirectUrl = (tableNumber) => {
    return `${window.location.origin}/table/${tableNumber}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-600 font-semibold">
        <span>Loading Table & QR Code Management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Restaurant Tables & QR Code Generator</h3>
            <p className="text-xs text-slate-500">Create tables and print unique self-ordering QR stickers</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 flex items-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {tables.map((table) => {
          let statusColor = 'bg-emerald-50 border-emerald-200 text-emerald-700';
          if (table.status === 'occupied') statusColor = 'bg-rose-50 border-rose-200 text-rose-700';
          if (table.status === 'reserved') statusColor = 'bg-amber-50 border-amber-200 text-amber-700';

          return (
            <div
              key={table.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-slate-900">{table.table_number}</span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                    {table.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>Capacity: {table.capacity} Seats</span>
                </div>
              </div>

              {/* QR Code Action Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">Table QR Sticker</p>
                    <p className="text-[10px] text-slate-500">Scan to Self-Order</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedQrTable(table)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer"
                >
                  View QR
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Delete Table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Restaurant Table</h3>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Table Number Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-06"
                  value={formData.table_number}
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-xs cursor-pointer"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Printable Modal */}
      {selectedQrTable && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                RestoFlow Table Sticker
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">{selectedQrTable.table_number}</h3>
              <p className="text-xs text-slate-500">Capacity: {selectedQrTable.capacity} Persons</p>
            </div>

            {/* Generated QR Code Image */}
            <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-md border border-slate-100">
              <img
                src={getQrUrl(selectedQrTable.table_number)}
                alt={`QR Code ${selectedQrTable.table_number}`}
                className="w-48 h-48"
              />
            </div>

            {/* Direct URL */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Direct Order Link</span>
              <div className="flex items-center justify-between text-xs text-emerald-700 font-mono truncate">
                <span className="truncate">{getDirectUrl(selectedQrTable.table_number)}</span>
                <a
                  href={getDirectUrl(selectedQrTable.table_number)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:text-emerald-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sticker</span>
              </button>
              <button
                onClick={() => setSelectedQrTable(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;

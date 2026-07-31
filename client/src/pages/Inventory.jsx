import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Boxes, Plus, AlertTriangle, RefreshCw } from 'lucide-react';

const Inventory = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const [itemForm, setItemForm] = useState({
    item_name: '',
    sku: '',
    unit: 'kg',
    stock_quantity: 10,
    min_stock_alert: 5,
  });

  const [txForm, setTxForm] = useState({
    inventory_id: '',
    type: 'in',
    quantity: 5,
    notes: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventories?per_page=100');
      if (res.success) {
        setInventories(res.data.data);
        if (res.data.data.length > 0) {
          setTxForm((prev) => ({ ...prev, inventory_id: res.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventories', itemForm);
      setShowItemModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.message || 'Failed to create inventory item');
    }
  };

  const handleRecordTx = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventories/transactions', txForm);
      setShowTxModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.message || 'Failed to record inventory transaction');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Inventory & Raw Ingredients Tracker</h3>
            <p className="text-xs text-slate-500">Track stock levels, alert thresholds, and transactions</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowTxModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Record Movement</span>
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Item</span>
          </button>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Ingredient Item</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Stock Quantity</th>
                <th className="pb-3">Alert Threshold</th>
                <th className="pb-3">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventories.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-3 font-bold text-slate-900">{inv.item_name}</td>
                  <td className="py-3 text-slate-500 font-mono">{inv.sku}</td>
                  <td className="py-3 font-extrabold text-slate-900">
                    {inv.stock_quantity} {inv.unit}
                  </td>
                  <td className="py-3 text-slate-500">
                    {inv.min_stock_alert} {inv.unit}
                  </td>
                  <td className="py-3">
                    {inv.is_low_stock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                        <AlertTriangle className="w-3 h-3" />
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal New Stock Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Stock Item</h3>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wagyu Beef Ribeye"
                  value={itemForm.item_name}
                  onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="BEEF-WAGYU-01"
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="kg / pcs / liter"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={itemForm.stock_quantity}
                    onChange={(e) => setItemForm({ ...itemForm, stock_quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Alert Threshold</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={itemForm.min_stock_alert}
                    onChange={(e) => setItemForm({ ...itemForm, min_stock_alert: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-xs cursor-pointer"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Record Stock Movement */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record Stock Movement</h3>

            <form onSubmit={handleRecordTx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Ingredient Item</label>
                <select
                  required
                  value={txForm.inventory_id}
                  onChange={(e) => setTxForm({ ...txForm, inventory_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none"
                >
                  {inventories.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.item_name} (Current: {inv.stock_quantity} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'in', label: 'Stock In' },
                    { key: 'out', label: 'Stock Out' },
                    { key: 'adjustment', label: 'Adjustment' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTxForm({ ...txForm, type: t.key })}
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        txForm.type === t.key
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={txForm.quantity}
                  onChange={(e) => setTxForm({ ...txForm, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Received fresh batch from supplier"
                  value={txForm.notes}
                  onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-xs cursor-pointer"
                >
                  Submit Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

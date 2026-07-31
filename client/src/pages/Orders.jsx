import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ClipboardList,
  Clock,
  Flame,
  Utensils,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders?per_page=100');
      if (res.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val || 0);

  const statuses = [
    { key: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-700 border-amber-200 bg-amber-50' },
    { key: 'cooking', label: 'Cooking', icon: Flame, color: 'text-rose-700 border-rose-200 bg-rose-50' },
    { key: 'served', label: 'Served', icon: Utensils, color: 'text-cyan-700 border-cyan-200 bg-cyan-50' },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-slate-600 border-slate-200 bg-slate-100' },
  ];

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-600 font-semibold">
        <span>Loading Kitchen & Live Order Pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Order Pipeline</h3>
            <p className="text-xs text-slate-500">Real-time status updates for kitchen and service staff</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === 'all' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({orders.length})
            </button>
            {statuses.map((s) => (
              <button
                key={s.key}
                onClick={() => setFilterStatus(s.key)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterStatus === s.key ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 italic rounded-2xl border border-slate-200 shadow-xs">
            No orders found matching the filter.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const currentStatusObj = statuses.find((s) => s.key === order.status) || statuses[0];

            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-600 tracking-wider">
                      {order.order_number}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {order.customer_name || 'Walk-in Guest'}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {order.restaurant_table ? `Table: ${order.restaurant_table.table_number}` : 'Takeaway'}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${currentStatusObj.color}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-slate-700">
                      <span>
                        <strong className="text-emerald-700 font-bold">{item.quantity}x</strong> {item.menu?.name || 'Item'}
                      </span>
                      <span className="font-semibold text-slate-500">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Final Bill</span>
                    <span className="text-sm font-extrabold text-emerald-600">
                      {formatCurrency(order.final_amount)}
                    </span>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cooking')}
                        className="flex-1 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
                      >
                        Start Cooking
                      </button>
                    )}

                    {order.status === 'cooking' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'served')}
                        className="flex-1 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100 text-xs font-bold transition cursor-pointer"
                      >
                        Mark Served
                      </button>
                    )}

                    {order.status === 'served' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="flex-1 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer"
                      >
                        Complete Order
                      </button>
                    )}

                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Orders;

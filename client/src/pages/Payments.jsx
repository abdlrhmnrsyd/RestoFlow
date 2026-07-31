import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  CreditCard,
  CheckCircle2,
  DollarSign,
  QrCode,
  Printer,
  Receipt,
  Sparkles,
  Check,
  Building2,
  Store,
} from 'lucide-react';

const Payments = () => {
  const [orders, setOrders] = useState([]);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [completedPayment, setCompletedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showMidtransModal, setShowMidtransModal] = useState(false);
  const [snapTokenData, setSnapTokenData] = useState(null);
  const [activeChannel, setActiveChannel] = useState('qris'); // 'qris', 'bank', 'card', 'retail'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, paymentsRes] = await Promise.all([
        api.get('/orders?per_page=100'),
        api.get('/payments?per_page=50'),
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.data.data.filter((o) => o.status !== 'completed' && o.status !== 'cancelled'));
      }
      if (paymentsRes.success) {
        setPaymentsHistory(paymentsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setAmountPaid(order.final_amount.toString());
    setError('');
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setError('');
    setSubmitting(true);

    try {
      if (paymentMethod === 'midtrans') {
        const tokenRes = await api.post('/payments/midtrans/snap-token', {
          order_id: selectedOrder.id,
        });

        if (tokenRes.success && tokenRes.data.snap_token) {
          const snapData = tokenRes.data;
          setSnapTokenData(snapData);

          if (!snapData.is_demo && window.snap && typeof window.snap.pay === 'function') {
            window.snap.pay(snapData.snap_token, {
              onSuccess: async function (result) {
                alert('Midtrans Payment Success!');
                fetchData();
                setSelectedOrder(null);
              },
              onPending: function (result) {
                alert('Payment pending. Please complete your transaction.');
              },
              onError: function (result) {
                alert('Payment failed.');
              },
            });
          } else {
            setShowMidtransModal(true);
          }
        }
      } else {
        const payload = {
          order_id: selectedOrder.id,
          amount_paid: parseFloat(amountPaid),
          payment_method: paymentMethod,
        };

        const res = await api.post('/payments', payload);

        if (res.success) {
          setCompletedPayment(res.data);
          setSelectedOrder(null);
          setAmountPaid('');
          fetchData();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateMidtransComplete = async (channelName) => {
    if (!selectedOrder) return;
    try {
      const res = await api.post('/payments', {
        order_id: selectedOrder.id,
        amount_paid: selectedOrder.final_amount,
        payment_method: 'midtrans_' + channelName.toLowerCase().replace(/\s+/g, '_'),
      });
      if (res.success) {
        setCompletedPayment(res.data);
        setShowMidtransModal(false);
        setSelectedOrder(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Gagal menyelesikan pembayaran.');
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val || 0);

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    const due = selectedOrder?.final_amount || 0;
    return Math.max(paid - due, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-600 font-semibold">
        <span>Loading Cashier Billing System...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Columns: Unpaid Orders & Payment History */}
      <div className="lg:col-span-2 space-y-8">
        {/* Unpaid Orders List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Orders Pending Payment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {orders.length === 0 ? (
              <p className="col-span-full text-xs text-slate-400 italic py-4">
                No orders waiting for checkout.
              </p>
            ) : (
              orders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <button
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600">{order.order_number}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {order.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {order.customer_name || 'Walk-in Guest'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {order.restaurant_table ? `Table: ${order.restaurant_table.table_number}` : 'Takeaway'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center">
                      <span className="text-xs text-slate-500">Bill Total</span>
                      <span className="text-sm font-extrabold text-emerald-600">
                        {formatCurrency(order.final_amount)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Payment History List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Recent Completed Transactions</h3>
          <div className="space-y-2">
            {paymentsHistory.map((pmt) => (
              <div
                key={pmt.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-bold text-emerald-600">{pmt.payment_number}</span>
                  <p className="text-xs text-slate-700 font-medium">Method: {pmt.payment_method.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-900">
                    Paid: {formatCurrency(pmt.amount_paid)}
                  </p>
                  <p className="text-[11px] text-slate-500">Change: {formatCurrency(pmt.change_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Cashier Billing Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs h-fit sticky top-24 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Cashier Billing Checkout</h3>
            <p className="text-xs text-slate-500">
              {selectedOrder ? selectedOrder.order_number : 'Select an unpaid order'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {selectedOrder ? (
          <form onSubmit={handleProcessPayment} className="space-y-5">
            {/* Bill Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Customer</span>
                <span className="font-semibold text-slate-900">{selectedOrder.customer_name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Table</span>
                <span className="font-semibold text-slate-900">
                  {selectedOrder.restaurant_table ? selectedOrder.restaurant_table.table_number : 'Takeaway'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-emerald-600 pt-2 border-t border-slate-200">
                <span>Total Amount Due</span>
                <span>{formatCurrency(selectedOrder.final_amount)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'cash', label: 'Cash', icon: DollarSign },
                  { key: 'credit_card', label: 'Manual Card', icon: CreditCard },
                  { key: 'midtrans', label: 'Midtrans Multi-Channel', icon: Sparkles, highlight: true },
                  { key: 'qris', label: 'QRIS Direct', icon: QrCode },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.key;

                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setPaymentMethod(m.key)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : m.highlight
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod !== 'midtrans' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Paid (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={selectedOrder.final_amount}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-900 font-extrabold outline-none"
                />
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Change Due</span>
                <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(calculateChange())}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Processing...'
              ) : paymentMethod === 'midtrans' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Pay with Midtrans Snap Gateway</span>
                </>
              ) : (
                'Complete Payment & Issue Receipt'
              )}
            </button>
          </form>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            Select an order from the list on the left to process checkout.
          </div>
        )}
      </div>

      {/* Multi-Channel Midtrans Modal */}
      {showMidtransModal && snapTokenData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-5 text-center max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Midtrans Multi-Channel Payment</h3>
              </div>
              <button
                onClick={() => setShowMidtransModal(false)}
                className="text-xs text-slate-400 font-bold hover:text-slate-600"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-500">Total Pembayaran</span>
              <p className="text-2xl font-extrabold text-emerald-600">
                {formatCurrency(snapTokenData.gross_amount)}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Order #{snapTokenData.order_number}</p>
            </div>

            {/* Multi-Channel Switcher */}
            <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setActiveChannel('qris')}
                className={`py-2 rounded-xl transition flex flex-col items-center gap-1 cursor-pointer ${
                  activeChannel === 'qris' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="text-[10px]">QRIS / E-Wallet</span>
              </button>
              <button
                onClick={() => setActiveChannel('bank')}
                className={`py-2 rounded-xl transition flex flex-col items-center gap-1 cursor-pointer ${
                  activeChannel === 'bank' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[10px]">Transfer VA</span>
              </button>
              <button
                onClick={() => setActiveChannel('card')}
                className={`py-2 rounded-xl transition flex flex-col items-center gap-1 cursor-pointer ${
                  activeChannel === 'card' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px]">Kartu Kredit</span>
              </button>
              <button
                onClick={() => setActiveChannel('retail')}
                className={`py-2 rounded-xl transition flex flex-col items-center gap-1 cursor-pointer ${
                  activeChannel === 'retail' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Store className="w-4 h-4" />
                <span className="text-[10px]">Indomaret</span>
              </button>
            </div>

            {/* Channel Content */}
            {activeChannel === 'qris' && (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit mx-auto">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MIDTRANS-QRIS-${snapTokenData.snap_token}`}
                    alt="QRIS Midtrans"
                    className="w-40 h-40 mx-auto"
                  />
                </div>
                <div className="flex justify-center gap-2 text-xs font-bold text-slate-600">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg">GoPay</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg">OVO</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg">ShopeePay</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg">DANA</span>
                </div>
                <button
                  onClick={() => handleSimulateMidtransComplete('QRIS / E-Wallet')}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Proses Bayar Lunas QRIS</span>
                </button>
              </div>
            )}

            {activeChannel === 'bank' && (
              <div className="space-y-3 text-left">
                <span className="text-xs font-bold text-slate-700 block">Virtual Account Channel:</span>
                {[
                  { bank: 'BCA Virtual Account', va: '880128391029381' },
                  { bank: 'Mandiri Bill Payment', va: '700148291039201' },
                  { bank: 'BNI Virtual Account', va: '988128391029382' },
                  { bank: 'BRI Virtual Account', va: '102938102938102' },
                ].map((b, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{b.bank}</span>
                      <p className="font-mono text-emerald-600 font-bold">{b.va}</p>
                    </div>
                    <button
                      onClick={() => handleSimulateMidtransComplete(b.bank)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition cursor-pointer"
                    >
                      Bayar VA
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeChannel === 'card' && (
              <div className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Nomor Kartu (Visa / Mastercard)</label>
                  <input
                    type="text"
                    readOnly
                    value="4811 •••• •••• 8829"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Exp Date</label>
                    <input
                      type="text"
                      readOnly
                      value="12/28"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">CVV</label>
                    <input
                      type="text"
                      readOnly
                      value="***"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSimulateMidtransComplete('Kartu Kredit')}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proses Otentikasi Kartu Kredit</span>
                </button>
              </div>
            )}

            {activeChannel === 'retail' && (
              <div className="space-y-3 text-left">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700">Kode Pembayaran Indomaret / Alfamart</span>
                  <p className="text-lg font-mono font-extrabold text-emerald-600">RESTO-991823901</p>
                  <p className="text-[11px] text-slate-500">Tunjukkan kode ini kepada kasir Indomaret / Alfamart terdekat.</p>
                </div>
                <button
                  onClick={() => handleSimulateMidtransComplete('Indomaret / Alfamart')}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Simulasi Kasir Retail Lunas</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {completedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-6">
            <div className="text-center space-y-2 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">RestoFlow Official Receipt</h3>
              <p className="text-xs text-slate-500">Payment Number: {completedPayment.payment_number}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Method</span>
                <span className="font-bold text-slate-900 uppercase">{completedPayment.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid</span>
                <span className="font-bold text-slate-900">{formatCurrency(completedPayment.amount_paid)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Change Returned</span>
                <span className="font-bold text-emerald-600">{formatCurrency(completedPayment.change_amount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedPayment(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;

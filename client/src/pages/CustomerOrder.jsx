import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  Utensils,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Search,
  User,
  Clock,
  Image as ImageIcon,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
  Store,
  BadgeCheck,
  Loader2,
} from 'lucide-react';

const CustomerOrder = () => {
  const { tableNumber } = useParams();
  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentOption, setPaymentOption] = useState('cash'); // 'cash' or 'midtrans'
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [error, setError] = useState('');
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showMidtransModal, setShowMidtransModal] = useState(false);
  const [snapTokenData, setSnapTokenData] = useState(null);
  const [activeChannel, setActiveChannel] = useState('qris'); // 'qris', 'bank', 'card', 'retail'
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchTableAndMenus();
    return () => stopStatusPolling();
  }, [tableNumber]);

  const fetchTableAndMenus = async () => {
    setLoading(true);
    setError('');
    try {
      const [tableRes, menuRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/v1/public/tables/${tableNumber}`),
        axios.get('http://localhost:8000/api/v1/public/menus'),
      ]);

      if (tableRes.data.success) {
        setTable(tableRes.data.data);
      }
      if (menuRes.data.success) {
        setCategories(menuRes.data.data.categories || []);
        setMenus(menuRes.data.data.menus || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Meja tidak ditemukan atau server offline.');
    } finally {
      setLoading(false);
    }
  };

  const startStatusPolling = (orderId) => {
    stopStatusPolling();
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/public/orders/${orderId}/status`);
        if (res.data.success && res.data.data.is_paid) {
          setSubmittedOrder((prev) =>
            prev ? { ...prev, status: 'completed', is_paid: true } : prev
          );
          setShowMidtransModal(false);
          stopStatusPolling();
        }
      } catch (err) {
        console.error('Polling payment status failed:', err);
      }
    }, 3000);
  };

  const stopStatusPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const addToCart = (menuItem) => {
    if (!menuItem.is_available || menuItem.stock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.menu_id === menuItem.id);
      if (existing) {
        if (existing.quantity >= menuItem.stock) return prevCart;
        return prevCart.map((item) =>
          item.menu_id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          menu_id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes: '',
        },
      ];
    });
  };

  const updateQuantity = (menuId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.menu_id === menuId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (menuId) => {
    setCart((prev) => prev.filter((item) => item.menu_id !== menuId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.10);
    const serviceFee = Math.round(subtotal * 0.05);
    const finalAmount = subtotal + tax + serviceFee;
    return { subtotal, tax, serviceFee, finalAmount };
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Silahkan masukan Nama Anda terlebih dahulu.');
      return;
    }
    if (cart.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        table_number: tableNumber,
        customer_name: customerName,
        notes: notes,
        items: cart.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const res = await axios.post('http://localhost:8000/api/v1/public/orders', payload);

      if (res.data.success) {
        const newOrder = res.data.data;
        setSubmittedOrder({ ...newOrder, chosen_payment_option: paymentOption, is_paid: false });
        setCart([]);
        setShowCartDrawer(false);

        if (paymentOption === 'midtrans') {
          triggerMidtransPayment(newOrder.id);
          startStatusPolling(newOrder.id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pesanan. Silahkan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerMidtransPayment = async (orderId) => {
    try {
      const tokenRes = await axios.post('http://localhost:8000/api/v1/payments/midtrans/snap-token', {
        order_id: orderId,
      });

      if (tokenRes.data.success && tokenRes.data.data.snap_token) {
        const snapData = tokenRes.data.data;
        setSnapTokenData(snapData);

        if (!snapData.is_demo && window.snap && typeof window.snap.pay === 'function') {
          window.snap.pay(snapData.snap_token, {
            onSuccess: async function (result) {
              confirmMidtransPaidOnBackend(orderId, 'midtrans_snap');
            },
            onPending: function (result) {
              alert('Pembayaran pending.');
            },
            onError: function (result) {
              alert('Pembayaran gagal.');
            },
          });
        } else {
          setShowMidtransModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to trigger Midtrans:', err);
    }
  };

  const confirmMidtransPaidOnBackend = async (orderId, method) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/public/orders/${orderId}/confirm-payment`,
        { payment_method: method }
      );
      if (res.data.success) {
        setSubmittedOrder((prev) =>
          prev ? { ...prev, status: 'completed', is_paid: true } : prev
        );
        setShowMidtransModal(false);
        stopStatusPolling();
      }
    } catch (err) {
      console.error('Confirm backend failed:', err);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val || 0);

  const filteredMenus = menus.filter((menu) => {
    const matchesCategory = selectedCategory ? menu.category_id === selectedCategory : true;
    const matchesSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const { subtotal, tax, serviceFee, finalAmount } = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-emerald-600 font-semibold space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Menyiapkan Menu Meja {tableNumber}...</span>
      </div>
    );
  }

  if (error && !table) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Meja Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 max-w-xs">{error}</p>
      </div>
    );
  }

  if (submittedOrder) {
    const isPaid = submittedOrder.is_paid || submittedOrder.status === 'completed';

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {isPaid ? 'Pembayaran Lunas Terverifikasi!' : 'Pesanan Diterima Dapur!'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">{submittedOrder.order_number}</h2>
            <p className="text-xs text-slate-600">
              Terima kasih, <strong className="text-slate-900">{submittedOrder.customer_name}</strong>! Hidangan Anda sedang diproses dan akan disajikan ke <strong className="text-emerald-600">Meja {tableNumber}</strong>.
            </p>
          </div>

          {/* Automatic Payment Status Banner */}
          {isPaid ? (
            <div className="p-4 rounded-2xl bg-emerald-500 text-white space-y-1.5 text-left text-xs shadow-md shadow-emerald-500/20">
              <div className="flex items-center gap-2 font-bold text-sm">
                <BadgeCheck className="w-5 h-5 text-white" />
                <span>Status Midtrans: TERVERIFIKASI LUNAS</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Midtrans telah mengonfirmasi transaksi lunas secara otomatis! Silahkan santai menunggu pesanan Anda tiba di meja.
              </p>
            </div>
          ) : submittedOrder.chosen_payment_option === 'cash' ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-left text-xs text-amber-800">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Banknote className="w-4 h-4 text-amber-700" />
                <span>Opsi 1: Pembayaran Tunai (Cash)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Silahkan melakukan pembayaran tunai ke <strong>Kasir Restoran</strong> saat/setelah makan. Kasir akan mengonfirmasi status pembayaran Anda.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-left text-xs text-emerald-800">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>Mendeteksi Pembayaran Midtrans...</span>
                </div>
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              </div>
              <p className="text-[11px] leading-relaxed">
                Sistem otomatis memantau respon Midtrans. Begitu transaksi selesai, status akan otomatis berubah menjadi LUNAS.
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-left text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Status Pembayaran Midtrans</span>
              {isPaid ? (
                <span className="font-extrabold text-emerald-600 uppercase flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>SETTLEMENT / PAID</span>
                </span>
              ) : (
                <span className="font-bold text-amber-600 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>WAITING FOR MIDTRANS</span>
                </span>
              )}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Tagihan</span>
              <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(submittedOrder.final_amount)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {!isPaid && submittedOrder.chosen_payment_option === 'midtrans' && (
              <button
                onClick={() => triggerMidtransPayment(submittedOrder.id)}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buka Kembali Midtrans Payment Gateway</span>
              </button>
            )}

            <button
              onClick={() => setSubmittedOrder(null)}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Pesan Menu Tambahan
            </button>
          </div>
        </div>

        {/* Multi-Channel Midtrans Payment Gateway Modal */}
        {showMidtransModal && snapTokenData && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-5 text-center max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Midtrans Payment Gateway</h3>
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

              {/* Multi-Channel Channel Switcher */}
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
                  <p className="text-[11px] text-slate-500">
                    Scan QRIS di atas dengan aplikasi m-Banking / E-Wallet Anda. Sistem akan otomatis mendeteksi transaksi begitu berhasil.
                  </p>
                </div>
              )}

              {activeChannel === 'bank' && (
                <div className="space-y-3 text-left">
                  <span className="text-xs font-bold text-slate-700 block">Pilih Bank Virtual Account:</span>
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
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-500 pt-1">
                    Transfer ke nomor VA di atas. Sistem otomatis memantau konfirmasi pembayaran dari bank.
                  </p>
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
                </div>
              )}

              {activeChannel === 'retail' && (
                <div className="space-y-3 text-left">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-700">Kode Pembayaran Indomaret / Alfamart</span>
                    <p className="text-lg font-mono font-extrabold text-emerald-600">RESTO-991823901</p>
                    <p className="text-[11px] text-slate-500">Tunjukkan kode ini kepada kasir Indomaret / Alfamart terdekat.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* Header Banner */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">
              RestoFlow Self-Order
            </h1>
            <p className="text-xs text-emerald-600 font-bold">Meja {tableNumber}</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Customer Name Section */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Nama Pemesan / Atas Nama</span>
          </label>
          <input
            type="text"
            required
            placeholder="Masukan nama Anda (misal: Budi / Siti)..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
          />
        </div>

        {/* Category Chips */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Pilih Kategori Menu</h3>

            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === null
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua Menu
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Cards */}
        <div className="space-y-3">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:border-emerald-300 transition"
            >
              {/* Food Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                {menu.image_url ? (
                  <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Dish Details */}
              <div className="space-y-1 flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">{menu.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{menu.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm font-extrabold text-emerald-600">
                    {formatCurrency(menu.price)}
                  </p>
                  <button
                    onClick={() => addToCart(menu)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-30 shadow-lg">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">{cart.reduce((s, i) => s + i.quantity, 0)} Item Dipilih</p>
              <p className="text-base font-extrabold text-emerald-600">{formatCurrency(finalAmount)}</p>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Lihat Pesanan</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal with 2 Payment Options */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-t-3xl sm:rounded-3xl border border-slate-200 space-y-6 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Pesanan Saya - Meja {tableNumber}</h3>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
              >
                Tutup
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.menu_id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                      <p className="text-[11px] text-slate-500">{formatCurrency(item.price)}</p>
                    </div>
                    <button onClick={() => removeItem(item.menu_id)} className="text-rose-500 hover:text-rose-600 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <input
                      type="text"
                      placeholder="Catatan (misal: pedas/sedikit es)..."
                      value={item.notes}
                      onChange={(e) => {
                        const note = e.target.value;
                        setCart((prev) =>
                          prev.map((i) => (i.menu_id === item.menu_id ? { ...i, notes: note } : i))
                        );
                      }}
                      className="w-40 px-2.5 py-1 rounded-lg bg-white text-[10px] text-slate-800 border border-slate-200 outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menu_id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menu_id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 text-xs border-t border-slate-100">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Pajak PB1 (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Service Charge (5%)</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-emerald-600 pt-2 border-t border-slate-100">
                <span>Total Tagihan</span>
                <span>{formatCurrency(finalAmount)}</span>
              </div>
            </div>

            {/* 2 Payment Options Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Metode Pembayaran:
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Cash at Cashier */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('cash')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    paymentOption === 'cash'
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold">1. Bayar Tunai (Cash)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Bayar di kasir saat/setelah makan. Di-konfirmasi kasir.
                  </p>
                </button>

                {/* Option 2: Cashless Midtrans */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('midtrans')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    paymentOption === 'midtrans'
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">2. Cashless (Midtrans)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Otomatis LUNAS begitu Midtrans mendeteksi pembayaran.
                  </p>
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting
                ? 'Mengirim ke Dapur...'
                : paymentOption === 'midtrans'
                ? 'Kirim Pesanan & Bayar via Midtrans'
                : 'Kirim Pesanan (Bayar Tunai di Kasir)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrder;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Grid,
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
  Users,
  Image as ImageIcon,
} from 'lucide-react';

const Pos = () => {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [tablesRes, categoriesRes, menusRes] = await Promise.all([
        api.get('/restaurant-tables?per_page=100'),
        api.get('/categories?per_page=100'),
        api.get('/menus?per_page=100'),
      ]);

      if (tablesRes.success) setTables(tablesRes.data.data);
      if (categoriesRes.success) setCategories(categoriesRes.data.data);
      if (menusRes.success) setMenus(menusRes.data.data);
    } catch (err) {
      console.error('Failed to load POS data:', err);
    } finally {
      setLoading(false);
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

  const handleCreateOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        restaurant_table_id: selectedTable?.id || null,
        customer_name: customerName || 'Walk-in Guest',
        notes: orderNotes,
        items: cart.map((item) => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const res = await api.post('/orders', payload);

      if (res.success) {
        setMessage({ type: 'success', text: `Order ${res.data.order_number} created successfully!` });
        setCart([]);
        setCustomerName('');
        setOrderNotes('');
        setSelectedTable(null);
        fetchInitialData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to place order.' });
    } finally {
      setSubmitting(false);
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
      <div className="flex items-center justify-center h-64 text-emerald-600 font-semibold">
        <span>Loading Floor Plan & POS Terminals...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 2 Columns: Table Selection & Menu Catalog */}
      <div className="lg:col-span-2 space-y-8">
        {/* Table Selection Grid */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
                <Grid className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Select Restaurant Table</h3>
            </div>
            {selectedTable && (
              <button
                onClick={() => setSelectedTable(null)}
                className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {tables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              let statusBg = 'bg-emerald-50 border-emerald-200 text-emerald-700';
              if (table.status === 'occupied') statusBg = 'bg-rose-50 border-rose-200 text-rose-700';
              if (table.status === 'reserved') statusBg = 'bg-amber-50 border-amber-200 text-amber-700';

              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${statusBg} ${
                    isSelected ? 'ring-2 ring-emerald-500 scale-[1.03] shadow-md' : 'hover:scale-[1.02]'
                  }`}
                >
                  <span className="font-extrabold text-sm">{table.table_number}</span>
                  <div className="flex items-center gap-1 text-[11px] opacity-80">
                    <Users className="w-3 h-3" />
                    <span>{table.capacity} Seats</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">{table.status}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Catalog */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-base font-bold text-slate-900">Menu Catalog</h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === null
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid with Food Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMenus.map((menu) => {
              const isOutOfStock = !menu.is_available || menu.stock <= 0;

              return (
                <div
                  key={menu.id}
                  className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between transition ${
                    isOutOfStock ? 'opacity-50' : 'hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-3 mb-3">
                    {/* Food Photo */}
                    <div className="w-full h-32 rounded-xl bg-slate-100 overflow-hidden border border-slate-100">
                      {menu.image_url ? (
                        <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{menu.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{menu.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-extrabold text-emerald-600">
                      {formatCurrency(menu.price)}
                    </span>
                    <button
                      onClick={() => addToCart(menu)}
                      disabled={isOutOfStock}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Order Checkout Cart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-fit sticky top-24 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Order Summary</h3>
              <p className="text-xs text-slate-500">
                {selectedTable ? `Table: ${selectedTable.table_number}` : 'Takeaway / Walk-in'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {cart.length} Items
          </span>
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

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Customer Name
          </label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-900 outline-none"
          />
        </div>

        {/* Cart Items List */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">
              Cart is empty. Select menu items to start order.
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.menu_id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                    <p className="text-[11px] text-slate-500">{formatCurrency(item.price)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.menu_id)}
                    className="text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="text"
                    placeholder="Note e.g. Less spicy"
                    value={item.notes}
                    onChange={(e) => {
                      const note = e.target.value;
                      setCart((prev) =>
                        prev.map((i) => (i.menu_id === item.menu_id ? { ...i, notes: note } : i))
                      );
                    }}
                    className="w-36 px-2 py-1 rounded-lg bg-white text-[10px] text-slate-800 border border-slate-200 outline-none"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menu_id, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menu_id, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Summary */}
        <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>PB1 Tax (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Service Charge (5%)</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-emerald-600 pt-2 border-t border-slate-100">
            <span>Total Bill</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
        </div>

        <button
          onClick={handleCreateOrder}
          disabled={submitting || cart.length === 0}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-40 cursor-pointer"
        >
          {submitting ? 'Submitting Order...' : 'Submit Kitchen Order'}
        </button>
      </div>
    </div>
  );
};

export default Pos;

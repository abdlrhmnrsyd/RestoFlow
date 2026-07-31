import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Grid,
  Flame,
  BarChart3,
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [popularMenus, setPopularMenus] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, popularRes, chartRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/popular-menus'),
          api.get('/dashboard/sales-chart?days=7'),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (popularRes.success) setPopularMenus(popularRes.data);
        if (chartRes.success) setSalesChart(chartRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-emerald-600 font-semibold">
        <span>Loading Executive Analytics...</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.total_revenue),
      icon: DollarSign,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats?.today_revenue),
      icon: TrendingUp,
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    },
    {
      title: "Today's Orders",
      value: stats?.today_orders || 0,
      icon: ShoppingBag,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      title: 'Pending Orders',
      value: stats?.pending_orders || 0,
      icon: Clock,
      color: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    {
      title: 'Completed Orders',
      value: stats?.completed_orders || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
    {
      title: 'Available Tables',
      value: `${stats?.available_tables || 0} / ${stats?.total_tables || 0}`,
      icon: Grid,
      color: 'bg-teal-50 border-teal-200 text-teal-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border shadow-xs transition hover:shadow-md ${card.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  {card.title}
                </span>
                <div className="p-1.5 rounded-lg bg-white shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-extrabold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">7-Day Revenue Trend</h3>
                <p className="text-xs text-slate-500">Daily breakdown of completed orders</p>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-4 border-b border-slate-100">
            {salesChart.map((item, index) => {
              const maxSales = Math.max(...salesChart.map((s) => s.total_sales), 1);
              const heightPercent = Math.max((item.total_sales / maxSales) * 100, 8);

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                    {formatCurrency(item.total_sales)}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] rounded-t-xl bg-emerald-500 group-hover:bg-emerald-600 transition-all shadow-xs"
                  ></div>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Menus Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Top Popular Menus</h3>
              <p className="text-xs text-slate-500">Most ordered dish contributions</p>
            </div>
          </div>

          <div className="space-y-3">
            {popularMenus.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No order items recorded yet.</p>
            ) : (
              popularMenus.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-emerald-700 text-xs font-bold flex items-center justify-center shadow-2xs">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.menu?.name}</p>
                      <p className="text-[11px] text-slate-500">{item.total_ordered} orders</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600">
                    {formatCurrency(item.total_revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

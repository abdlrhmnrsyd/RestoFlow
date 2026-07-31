<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\RestaurantTable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Class DashboardService
 * Service layer for aggregating restaurant performance analytics and statistics.
 */
class DashboardService
{
    /**
     * Get high-level KPI dashboard statistics.
     *
     * @return array<string, mixed>
     */
    public function getStats(): array
    {
        return Cache::remember('dashboard_stats', 60, function () {
            $today = Carbon::today();

            $totalRevenue = (float) Payment::where('status', 'success')->sum('amount_paid') - Payment::where('status', 'success')->sum('change_amount');
            $todayRevenue = (float) Payment::where('status', 'success')
                ->whereDate('paid_at', $today)
                ->get()
                ->sum(fn ($p) => $p->amount_paid - $p->change_amount);

            $todayOrders = Order::whereDate('created_at', $today)->count();
            $pendingOrders = Order::where('status', 'pending')->count();
            $completedOrders = Order::where('status', 'completed')->count();
            $availableTables = RestaurantTable::where('status', 'available')->count();
            $totalTables = RestaurantTable::count();

            return [
                'total_revenue' => $totalRevenue,
                'today_revenue' => $todayRevenue,
                'today_orders' => $todayOrders,
                'pending_orders' => $pendingOrders,
                'completed_orders' => $completedOrders,
                'available_tables' => $availableTables,
                'total_tables' => $totalTables,
            ];
        });
    }

    /**
     * Get top 5 popular menu items ordered.
     *
     * @param int $limit
     * @return array
     */
    public function getPopularMenus(int $limit = 5): array
    {
        return Cache::remember("dashboard_popular_menus_{$limit}", 300, function () use ($limit) {
            return OrderItem::select('menu_id', DB::raw('SUM(quantity) as total_ordered'), DB::raw('SUM(subtotal) as total_revenue'))
                ->with('menu:id,name,price,image_url')
                ->groupBy('menu_id')
                ->orderByDesc('total_ordered')
                ->limit($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * Get daily sales chart data for last N days.
     *
     * @param int $days
     * @return array
     */
    public function getSalesChart(int $days = 7): array
    {
        return Cache::remember("dashboard_sales_chart_{$days}", 300, function () use ($days) {
            $startDate = Carbon::today()->subDays($days - 1);

            $sales = Order::where('status', 'completed')
                ->whereDate('created_at', '>=', $startDate)
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(final_amount) as total_sales'), DB::raw('COUNT(id) as total_orders'))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->keyBy('date');

            $chartData = [];
            for ($i = 0; $i < $days; $i++) {
                $dateStr = $startDate->copy()->addDays($i)->format('Y-m-d');
                $item = $sales->get($dateStr);

                $chartData[] = [
                    'date' => $dateStr,
                    'total_sales' => $item ? (float) $item->total_sales : 0.0,
                    'total_orders' => $item ? (int) $item->total_orders : 0,
                ];
            }

            return $chartData;
        });
    }
}

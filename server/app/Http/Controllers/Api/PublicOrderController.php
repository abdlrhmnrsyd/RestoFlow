<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\PublicStoreOrderRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\MenuResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\RestaurantTableResource;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Payment;
use App\Models\RestaurantTable;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Class PublicOrderController
 * @package App\Http\Controllers\Api
 * 
 * Handles unauthenticated self-ordering by customers scanning table QR codes.
 */
class PublicOrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Get table details by table number for scanning verification.
     *
     * @param string $tableNumber
     * @return JsonResponse
     */
    public function getTableInfo(string $tableNumber): JsonResponse
    {
        $table = RestaurantTable::where('table_number', $tableNumber)->first();

        if (!$table) {
            return $this->notFoundResponse("Table '{$tableNumber}' was not found.");
        }

        return $this->successResponse(
            new RestaurantTableResource($table),
            'Table information retrieved successfully.'
        );
    }

    /**
     * Get active categories and available menus for public browsing.
     *
     * @return JsonResponse
     */
    public function getMenus(): JsonResponse
    {
        $categories = Category::where('is_active', true)->get();
        $menus = Menu::where('is_available', true)
            ->where('stock', '>', 0)
            ->with('category')
            ->get();

        return $this->successResponse([
            'categories' => CategoryResource::collection($categories),
            'menus' => MenuResource::collection($menus),
        ], 'Public menu catalog retrieved successfully.');
    }

    /**
     * Store self-service order submitted by customer at table.
     *
     * @param PublicStoreOrderRequest $request
     * @return JsonResponse
     */
    public function storeOrder(PublicStoreOrderRequest $request): JsonResponse
    {
        $tableNumber = $request->validated('table_number');
        $table = RestaurantTable::where('table_number', $tableNumber)->first();

        if (!$table) {
            return $this->notFoundResponse("Table '{$tableNumber}' not found.");
        }

        // Get default system user (e.g., Admin ID 1) for guest orders
        $systemUser = User::first() ?? User::factory()->create();

        $orderData = [
            'restaurant_table_id' => $table->id,
            'customer_name' => $request->validated('customer_name'),
            'notes' => $request->validated('notes'),
            'items' => $request->validated('items'),
        ];

        $order = $this->orderService->createOrder($systemUser, $orderData);

        return $this->successResponse(
            new OrderResource($order),
            'Your order has been placed successfully! The kitchen is preparing your meal.',
            201
        );
    }

    /**
     * Check real-time payment & order status for Midtrans detection.
     *
     * @param int $orderId
     * @return JsonResponse
     */
    public function getOrderStatus(int $orderId): JsonResponse
    {
        $order = Order::with(['payment', 'restaurantTable'])->find($orderId);

        if (!$order) {
            return $this->notFoundResponse("Order #{$orderId} not found.");
        }

        $isPaid = $order->status === 'completed' || ($order->payment && $order->payment->status === 'completed');

        return $this->successResponse([
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'is_paid' => $isPaid,
            'payment' => $order->payment,
        ], 'Order status retrieved successfully.');
    }

    /**
     * Confirm cashless payment when Midtrans returns successful payment result.
     *
     * @param Request $request
     * @param int $orderId
     * @return JsonResponse
     */
    public function confirmPayment(Request $request, int $orderId): JsonResponse
    {
        $order = Order::find($orderId);

        if (!$order) {
            return $this->notFoundResponse("Order #{$orderId} not found.");
        }

        $paymentMethod = $request->input('payment_method', 'midtrans_cashless');

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'payment_number' => 'PMT-MIDTRANS-' . strtoupper(Str::random(6)),
                'amount_paid' => (float) $order->final_amount,
                'change_amount' => 0,
                'payment_method' => $paymentMethod,
                'status' => 'completed',
            ]
        );

        $order->update(['status' => 'completed']);

        if ($order->restaurant_table_id) {
            RestaurantTable::where('id', $order->restaurant_table_id)->update(['status' => 'available']);
        }

        return $this->successResponse(
            new OrderResource($order->fresh(['restaurantTable', 'orderItems.menu'])),
            'Pembayaran Midtrans berhasil dideteksi & terkonfirmasi otomatis LUNAS!'
        );
    }
}

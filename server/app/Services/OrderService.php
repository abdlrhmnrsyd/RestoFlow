<?php

namespace App\Services;

use App\Models\Menu;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\User;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Class OrderService
 * Service layer for Order business logic and calculations.
 */
class OrderService
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository
    ) {}

    public function getPaginated(
        int $perPage = 15,
        ?string $search = null,
        string $sortBy = 'id',
        string $sortOrder = 'desc',
        array $filters = []
    ): LengthAwarePaginator {
        return $this->orderRepository->getPaginated(
            perPage: $perPage,
            relations: ['restaurantTable', 'user', 'orderItems.menu', 'payment'],
            search: $search,
            searchableFields: ['order_number', 'customer_name'],
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );
    }

    public function createOrder(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data) {
            $tableId = $data['restaurant_table_id'] ?? null;

            if ($tableId) {
                $table = RestaurantTable::find($tableId);
                if (!$table) {
                    throw ValidationException::withMessages([
                        'restaurant_table_id' => ['Selected table not found.'],
                    ]);
                }
            }

            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            $totalAmount = 0;
            $itemsToCreate = [];

            foreach ($data['items'] as $item) {
                $menu = Menu::find($item['menu_id']);
                if (!$menu || !$menu->is_available) {
                    throw ValidationException::withMessages([
                        'items' => ["Menu item ID {$item['menu_id']} is not available."],
                    ]);
                }

                if ($menu->stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Insufficient stock for menu '{$menu->name}'. Available: {$menu->stock}."],
                    ]);
                }

                $subtotal = $menu->price * $item['quantity'];
                $totalAmount += $subtotal;

                // Decrement menu stock
                $menu->decrement('stock', $item['quantity']);

                $itemsToCreate[] = [
                    'menu_id' => $menu->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menu->price,
                    'subtotal' => $subtotal,
                    'notes' => $item['notes'] ?? null,
                ];
            }

            // Calculate Tax (10%) and Service Charge (5%)
            $taxAmount = round($totalAmount * 0.10, 2);
            $serviceCharge = round($totalAmount * 0.05, 2);
            $finalAmount = $totalAmount + $taxAmount + $serviceCharge;

            /** @var Order $order */
            $order = $this->orderRepository->create([
                'order_number' => $orderNumber,
                'restaurant_table_id' => $tableId,
                'user_id' => $user->id,
                'customer_name' => $data['customer_name'] ?? null,
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'tax_amount' => $taxAmount,
                'service_charge' => $serviceCharge,
                'final_amount' => $finalAmount,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($itemsToCreate as $itemData) {
                $order->orderItems()->create($itemData);
            }

            // Update Table Status to occupied if assigned
            if ($tableId) {
                RestaurantTable::where('id', $tableId)->update(['status' => 'occupied']);
            }

            return $order->load(['restaurantTable', 'user', 'orderItems.menu']);
        });
    }

    public function getOrderById(int|string $id): Order
    {
        $order = $this->orderRepository->findById($id, ['restaurantTable', 'user', 'orderItems.menu', 'payment']);

        if (!$order) {
            abort(404, 'Order not found.');
        }

        return $order;
    }

    public function updateOrderStatus(int|string $id, string $status): Order
    {
        $order = $this->getOrderById($id);

        $this->orderRepository->update($id, ['status' => $status]);

        // If order completed or cancelled, release table status back to available
        if (in_array($status, ['completed', 'cancelled']) && $order->restaurant_table_id) {
            RestaurantTable::where('id', $order->restaurant_table_id)->update(['status' => 'available']);
        }

        return $order->fresh(['restaurantTable', 'user', 'orderItems.menu', 'payment']);
    }

    public function deleteOrder(int|string $id): bool
    {
        return $this->orderRepository->delete($id);
    }
}

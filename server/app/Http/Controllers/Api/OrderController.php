<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class OrderController
 * @package App\Http\Controllers\Api
 * 
 * RESTful API Controller for Order Management.
 */
class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $perPage = (int) $request->query('per_page', 15);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'desc');

        $filters = [];
        if ($request->has('status')) {
            $filters['status'] = $request->query('status');
        }
        if ($request->has('restaurant_table_id')) {
            $filters['restaurant_table_id'] = $request->query('restaurant_table_id');
        }

        $orders = $this->orderService->getPaginated(
            perPage: $perPage,
            search: $search,
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );

        return $this->successResponse(
            OrderResource::collection($orders)->response()->getData(true),
            'Orders retrieved successfully.'
        );
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $this->authorize('create', Order::class);

        $order = $this->orderService->createOrder($request->user(), $request->validated());

        return $this->successResponse(
            new OrderResource($order),
            'Order created successfully.',
            201
        );
    }

    public function show(int|string $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id);
        $this->authorize('view', $order);

        return $this->successResponse(
            new OrderResource($order),
            'Order details retrieved successfully.'
        );
    }

    public function updateStatus(UpdateOrderStatusRequest $request, int|string $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id);
        $this->authorize('update', $order);

        $updatedOrder = $this->orderService->updateOrderStatus($id, $request->validated('status'));

        return $this->successResponse(
            new OrderResource($updatedOrder),
            'Order status updated successfully.'
        );
    }

    public function destroy(int|string $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id);
        $this->authorize('delete', $order);

        $this->orderService->deleteOrder($id);

        return $this->successResponse(null, 'Order deleted successfully.');
    }
}

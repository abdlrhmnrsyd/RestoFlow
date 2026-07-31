<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\RecordTransactionRequest;
use App\Http\Requests\Inventory\StoreInventoryRequest;
use App\Http\Resources\InventoryResource;
use App\Http\Resources\InventoryTransactionResource;
use App\Models\Inventory;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class InventoryController
 * @package App\Http\Controllers\Api
 * 
 * RESTful API Controller for Inventory & Stock Management.
 */
class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Inventory::class);

        $perPage = (int) $request->query('per_page', 15);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'desc');

        $inventories = $this->inventoryService->getPaginated(
            perPage: $perPage,
            search: $search,
            sortBy: $sortBy,
            sortOrder: $sortOrder
        );

        return $this->successResponse(
            InventoryResource::collection($inventories)->response()->getData(true),
            'Inventory items retrieved successfully.'
        );
    }

    public function store(StoreInventoryRequest $request): JsonResponse
    {
        $this->authorize('create', Inventory::class);

        $inventory = $this->inventoryService->createInventory($request->validated());

        return $this->successResponse(
            new InventoryResource($inventory),
            'Inventory item created successfully.',
            201
        );
    }

    public function show(int|string $id): JsonResponse
    {
        $inventory = $this->inventoryService->getInventoryById($id);
        $this->authorize('view', $inventory);

        return $this->successResponse(
            new InventoryResource($inventory),
            'Inventory detail retrieved successfully.'
        );
    }

    public function recordTransaction(RecordTransactionRequest $request): JsonResponse
    {
        $this->authorize('create', Inventory::class);

        $transaction = $this->inventoryService->recordTransaction($request->validated());

        return $this->successResponse(
            new InventoryTransactionResource($transaction),
            'Inventory transaction recorded successfully.',
            201
        );
    }
}

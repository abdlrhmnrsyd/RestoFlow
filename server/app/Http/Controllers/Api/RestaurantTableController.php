<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RestaurantTable\StoreRestaurantTableRequest;
use App\Http\Requests\RestaurantTable\UpdateRestaurantTableRequest;
use App\Http\Resources\RestaurantTableResource;
use App\Models\RestaurantTable;
use App\Services\RestaurantTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class RestaurantTableController
 * @package App\Http\Controllers\Api
 * 
 * RESTful API Controller for Restaurant Table Management.
 */
class RestaurantTableController extends Controller
{
    public function __construct(
        protected RestaurantTableService $tableService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', RestaurantTable::class);

        $perPage = (int) $request->query('per_page', 15);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'desc');

        $filters = [];
        if ($request->has('status')) {
            $filters['status'] = $request->query('status');
        }

        $tables = $this->tableService->getPaginated(
            perPage: $perPage,
            search: $search,
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );

        return $this->successResponse(
            RestaurantTableResource::collection($tables)->response()->getData(true),
            'Restaurant tables retrieved successfully.'
        );
    }

    public function store(StoreRestaurantTableRequest $request): JsonResponse
    {
        $this->authorize('create', RestaurantTable::class);

        $table = $this->tableService->createTable($request->validated());

        return $this->successResponse(
            new RestaurantTableResource($table),
            'Restaurant table created successfully.',
            201
        );
    }

    public function show(int|string $id): JsonResponse
    {
        $table = $this->tableService->getTableById($id);
        $this->authorize('view', $table);

        return $this->successResponse(
            new RestaurantTableResource($table),
            'Restaurant table detail retrieved successfully.'
        );
    }

    public function update(UpdateRestaurantTableRequest $request, int|string $id): JsonResponse
    {
        $table = $this->tableService->getTableById($id);
        $this->authorize('update', $table);

        $updatedTable = $this->tableService->updateTable($id, $request->validated());

        return $this->successResponse(
            new RestaurantTableResource($updatedTable),
            'Restaurant table updated successfully.'
        );
    }

    public function destroy(int|string $id): JsonResponse
    {
        $table = $this->tableService->getTableById($id);
        $this->authorize('delete', $table);

        $this->tableService->deleteTable($id);

        return $this->successResponse(null, 'Restaurant table deleted successfully.');
    }
}

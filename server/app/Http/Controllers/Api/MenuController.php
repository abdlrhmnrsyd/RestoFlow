<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Menu\StoreMenuRequest;
use App\Http\Requests\Menu\UpdateMenuRequest;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Services\MenuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class MenuController
 * @package App\Http\Controllers\Api
 * 
 * RESTful API Controller for Menu Management.
 */
class MenuController extends Controller
{
    public function __construct(
        protected MenuService $menuService
    ) {}

    /**
     * Display a listing of menus with search, sort, filter, and pagination.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Menu::class);

        $perPage = (int) $request->query('per_page', 15);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'desc');

        $filters = [];
        if ($request->has('category_id')) {
            $filters['category_id'] = $request->query('category_id');
        }
        if ($request->has('is_available')) {
            $filters['is_available'] = filter_var($request->query('is_available'), FILTER_VALIDATE_BOOLEAN);
        }

        $menus = $this->menuService->getPaginated(
            perPage: $perPage,
            search: $search,
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );

        return $this->successResponse(
            MenuResource::collection($menus)->response()->getData(true),
            'Menus retrieved successfully.'
        );
    }

    /**
     * Store a newly created menu.
     *
     * @param StoreMenuRequest $request
     * @return JsonResponse
     */
    public function store(StoreMenuRequest $request): JsonResponse
    {
        $this->authorize('create', Menu::class);

        $menu = $this->menuService->createMenu(
            $request->validated(),
            $request->file('image')
        );

        return $this->successResponse(
            new MenuResource($menu),
            'Menu item created successfully.',
            201
        );
    }

    /**
     * Display the specified menu.
     *
     * @param int|string $id
     * @return JsonResponse
     */
    public function show(int|string $id): JsonResponse
    {
        $menu = $this->menuService->getMenuById($id);
        $this->authorize('view', $menu);

        return $this->successResponse(
            new MenuResource($menu),
            'Menu item detail retrieved successfully.'
        );
    }

    /**
     * Update the specified menu.
     *
     * @param UpdateMenuRequest $request
     * @param int|string $id
     * @return JsonResponse
     */
    public function update(UpdateMenuRequest $request, int|string $id): JsonResponse
    {
        $menu = $this->menuService->getMenuById($id);
        $this->authorize('update', $menu);

        $updatedMenu = $this->menuService->updateMenu(
            $id,
            $request->validated(),
            $request->file('image')
        );

        return $this->successResponse(
            new MenuResource($updatedMenu),
            'Menu item updated successfully.'
        );
    }

    /**
     * Remove the specified menu.
     *
     * @param int|string $id
     * @return JsonResponse
     */
    public function destroy(int|string $id): JsonResponse
    {
        $menu = $this->menuService->getMenuById($id);
        $this->authorize('delete', $menu);

        $this->menuService->deleteMenu($id);

        return $this->successResponse(null, 'Menu item deleted successfully.');
    }
}

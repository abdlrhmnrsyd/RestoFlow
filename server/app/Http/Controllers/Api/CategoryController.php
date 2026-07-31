<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class CategoryController
 * @package App\Http\Controllers\Api
 * 
 * RESTful API Controller for Category Management.
 */
class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * Display a listing of categories with pagination, search, sorting, and filtering.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $perPage = (int) $request->query('per_page', 15);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'desc');

        $filters = [];
        if ($request->has('is_active')) {
            $filters['is_active'] = filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        $categories = $this->categoryService->getPaginated(
            perPage: $perPage,
            search: $search,
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );

        return $this->successResponse(
            CategoryResource::collection($categories)->response()->getData(true),
            'Categories retrieved successfully.'
        );
    }

    /**
     * Store a newly created category.
     *
     * @param StoreCategoryRequest $request
     * @return JsonResponse
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $category = $this->categoryService->createCategory($request->validated());

        return $this->successResponse(
            new CategoryResource($category),
            'Category created successfully.',
            201
        );
    }

    /**
     * Display the specified category.
     *
     * @param int|string $id
     * @return JsonResponse
     */
    public function show(int|string $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);
        $this->authorize('view', $category);

        return $this->successResponse(
            new CategoryResource($category),
            'Category detail retrieved successfully.'
        );
    }

    /**
     * Update the specified category.
     *
     * @param UpdateCategoryRequest $request
     * @param int|string $id
     * @return JsonResponse
     */
    public function update(UpdateCategoryRequest $request, int|string $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);
        $this->authorize('update', $category);

        $updatedCategory = $this->categoryService->updateCategory($id, $request->validated());

        return $this->successResponse(
            new CategoryResource($updatedCategory),
            'Category updated successfully.'
        );
    }

    /**
     * Remove the specified category.
     *
     * @param int|string $id
     * @return JsonResponse
     */
    public function destroy(int|string $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);
        $this->authorize('delete', $category);

        $this->categoryService->deleteCategory($id);

        return $this->successResponse(null, 'Category deleted successfully.');
    }
}

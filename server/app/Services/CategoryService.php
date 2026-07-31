<?php

namespace App\Services;

use App\Models\Category;
use App\Repositories\Interfaces\CategoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class CategoryService
 * Service layer for Category business logic.
 */
class CategoryService
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository
    ) {}

    /**
     * Get paginated list of categories.
     *
     * @param int $perPage
     * @param string|null $search
     * @param string $sortBy
     * @param string $sortOrder
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginated(
        int $perPage = 15,
        ?string $search = null,
        string $sortBy = 'id',
        string $sortOrder = 'desc',
        array $filters = []
    ): LengthAwarePaginator {
        return $this->categoryRepository->getPaginated(
            perPage: $perPage,
            relations: ['menus'],
            search: $search,
            searchableFields: ['name', 'description'],
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );
    }

    /**
     * Create a new category.
     *
     * @param array $data
     * @return Category
     */
    public function createCategory(array $data): Category
    {
        /** @var Category $category */
        $category = $this->categoryRepository->create($data);
        return $category;
    }

    /**
     * Get category detail by ID.
     *
     * @param int|string $id
     * @return Category
     */
    public function getCategoryById(int|string $id): Category
    {
        $category = $this->categoryRepository->findById($id, ['menus']);
        
        if (!$category) {
            abort(404, 'Category not found.');
        }

        return $category;
    }

    /**
     * Update an existing category.
     *
     * @param int|string $id
     * @param array $data
     * @return Category
     */
    public function updateCategory(int|string $id, array $data): Category
    {
        /** @var Category $category */
        $category = $this->categoryRepository->update($id, $data);
        return $category;
    }

    /**
     * Delete a category.
     *
     * @param int|string $id
     * @return bool
     */
    public function deleteCategory(int|string $id): bool
    {
        return $this->categoryRepository->delete($id);
    }
}

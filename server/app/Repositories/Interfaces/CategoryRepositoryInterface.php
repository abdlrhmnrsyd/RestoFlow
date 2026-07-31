<?php

namespace App\Repositories\Interfaces;

use App\Models\Category;

/**
 * Interface CategoryRepositoryInterface
 * Contract for Category repository operations.
 */
interface CategoryRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find category by slug.
     *
     * @param string $slug
     * @return Category|null
     */
    public function findBySlug(string $slug): ?Category;
}

<?php

namespace App\Repositories\Interfaces;

use App\Models\Menu;

/**
 * Interface MenuRepositoryInterface
 * Contract for Menu repository operations.
 */
interface MenuRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find menu by slug.
     *
     * @param string $slug
     * @return Menu|null
     */
    public function findBySlug(string $slug): ?Menu;
}

<?php

namespace App\Repositories\Interfaces;

use App\Models\Inventory;

/**
 * Interface InventoryRepositoryInterface
 * Contract for Inventory repository operations.
 */
interface InventoryRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find item by SKU.
     *
     * @param string $sku
     * @return Inventory|null
     */
    public function findBySku(string $sku): ?Inventory;
}

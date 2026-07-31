<?php

namespace App\Repositories\Interfaces;

use App\Models\RestaurantTable;

/**
 * Interface RestaurantTableRepositoryInterface
 * Contract for RestaurantTable repository operations.
 */
interface RestaurantTableRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find table by table number.
     *
     * @param string $tableNumber
     * @return RestaurantTable|null
     */
    public function findByTableNumber(string $tableNumber): ?RestaurantTable;
}

<?php

namespace App\Repositories\Interfaces;

use App\Models\Order;

/**
 * Interface OrderRepositoryInterface
 * Contract for Order repository operations.
 */
interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find order by order number.
     *
     * @param string $orderNumber
     * @return Order|null
     */
    public function findByOrderNumber(string $orderNumber): ?Order;
}

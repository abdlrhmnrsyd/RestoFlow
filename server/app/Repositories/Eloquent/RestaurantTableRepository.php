<?php

namespace App\Repositories\Eloquent;

use App\Models\RestaurantTable;
use App\Repositories\Interfaces\RestaurantTableRepositoryInterface;

/**
 * Class RestaurantTableRepository
 * Eloquent implementation of RestaurantTableRepositoryInterface.
 */
class RestaurantTableRepository extends BaseRepository implements RestaurantTableRepositoryInterface
{
    public function __construct(RestaurantTable $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByTableNumber(string $tableNumber): ?RestaurantTable
    {
        return $this->model->where('table_number', $tableNumber)->first();
    }
}

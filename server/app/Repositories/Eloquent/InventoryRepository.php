<?php

namespace App\Repositories\Eloquent;

use App\Models\Inventory;
use App\Repositories\Interfaces\InventoryRepositoryInterface;

/**
 * Class InventoryRepository
 * Eloquent implementation of InventoryRepositoryInterface.
 */
class InventoryRepository extends BaseRepository implements InventoryRepositoryInterface
{
    public function __construct(Inventory $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findBySku(string $sku): ?Inventory
    {
        return $this->model->where('sku', $sku)->first();
    }
}

<?php

namespace App\Repositories\Eloquent;

use App\Models\Menu;
use App\Repositories\Interfaces\MenuRepositoryInterface;

/**
 * Class MenuRepository
 * Eloquent implementation of MenuRepositoryInterface.
 */
class MenuRepository extends BaseRepository implements MenuRepositoryInterface
{
    public function __construct(Menu $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findBySlug(string $slug): ?Menu
    {
        return $this->model->where('slug', $slug)->first();
    }
}

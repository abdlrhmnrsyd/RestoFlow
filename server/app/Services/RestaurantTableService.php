<?php

namespace App\Services;

use App\Models\RestaurantTable;
use App\Repositories\Interfaces\RestaurantTableRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class RestaurantTableService
 * Service layer for RestaurantTable management.
 */
class RestaurantTableService
{
    public function __construct(
        protected RestaurantTableRepositoryInterface $tableRepository
    ) {}

    public function getPaginated(
        int $perPage = 15,
        ?string $search = null,
        string $sortBy = 'id',
        string $sortOrder = 'desc',
        array $filters = []
    ): LengthAwarePaginator {
        return $this->tableRepository->getPaginated(
            perPage: $perPage,
            relations: [],
            search: $search,
            searchableFields: ['table_number'],
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );
    }

    public function createTable(array $data): RestaurantTable
    {
        /** @var RestaurantTable $table */
        $table = $this->tableRepository->create($data);
        return $table;
    }

    public function getTableById(int|string $id): RestaurantTable
    {
        $table = $this->tableRepository->findById($id);

        if (!$table) {
            abort(404, 'Restaurant table not found.');
        }

        return $table;
    }

    public function updateTable(int|string $id, array $data): RestaurantTable
    {
        /** @var RestaurantTable $table */
        $table = $this->tableRepository->update($id, $data);
        return $table;
    }

    public function deleteTable(int|string $id): bool
    {
        return $this->tableRepository->delete($id);
    }
}

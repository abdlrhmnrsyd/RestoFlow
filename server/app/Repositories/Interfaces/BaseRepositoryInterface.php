<?php

namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Interface BaseRepositoryInterface
 * Standard generic contract for Eloquent repositories.
 */
interface BaseRepositoryInterface
{
    /**
     * Get all records.
     *
     * @param array $columns
     * @param array $relations
     * @return Collection
     */
    public function all(array $columns = ['*'], array $relations = []): Collection;

    /**
     * Get paginated records with optional search, sorting, filtering, and eager loaded relations.
     *
     * @param int $perPage
     * @param array $relations
     * @param string|null $search
     * @param array $searchableFields
     * @param string $sortBy
     * @param string $sortOrder
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginated(
        int $perPage = 15,
        array $relations = [],
        ?string $search = null,
        array $searchableFields = [],
        string $sortBy = 'id',
        string $sortOrder = 'desc',
        array $filters = []
    ): LengthAwarePaginator;

    /**
     * Find record by ID.
     *
     * @param int|string $id
     * @param array $relations
     * @return Model|null
     */
    public function findById(int|string $id, array $relations = []): ?Model;

    /**
     * Create a new record.
     *
     * @param array $attributes
     * @return Model
     */
    public function create(array $attributes): Model;

    /**
     * Update an existing record by ID.
     *
     * @param int|string $id
     * @param array $attributes
     * @return Model
     */
    public function update(int|string $id, array $attributes): Model;

    /**
     * Delete a record by ID.
     *
     * @param int|string $id
     * @return bool
     */
    public function delete(int|string $id): bool;
}

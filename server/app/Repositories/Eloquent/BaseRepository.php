<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Interfaces\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class BaseRepository
 * Abstract base class implementing BaseRepositoryInterface for Eloquent models.
 */
abstract class BaseRepository implements BaseRepositoryInterface
{
    /**
     * @var Model
     */
    protected Model $model;

    /**
     * BaseRepository constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * @inheritDoc
     */
    public function all(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->model->with($relations)->get($columns);
    }

    /**
     * @inheritDoc
     */
    public function getPaginated(
        int $perPage = 15,
        array $relations = [],
        ?string $search = null,
        array $searchableFields = [],
        string $sortBy = 'id',
        string $sortOrder = 'desc',
        array $filters = []
    ): LengthAwarePaginator {
        $query = $this->model->with($relations);

        // Apply Search
        if ($search && !empty($searchableFields)) {
            $query->where(function (Builder $q) use ($search, $searchableFields) {
                foreach ($searchableFields as $index => $field) {
                    if ($index === 0) {
                        $q->where($field, 'LIKE', "%{$search}%");
                    } else {
                        $q->orWhere($field, 'LIKE', "%{$search}%");
                    }
                }
            });
        }

        // Apply Custom Filters
        foreach ($filters as $field => $value) {
            if ($value !== null && $value !== '') {
                $query->where($field, $value);
            }
        }

        // Apply Sorting
        $query->orderBy($sortBy, strtolower($sortOrder) === 'asc' ? 'asc' : 'desc');

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function findById(int|string $id, array $relations = []): ?Model
    {
        return $this->model->with($relations)->find($id);
    }

    /**
     * @inheritDoc
     */
    public function create(array $attributes): Model
    {
        return $this->model->create($attributes);
    }

    /**
     * @inheritDoc
     */
    public function update(int|string $id, array $attributes): Model
    {
        $record = $this->model->findOrFail($id);
        $record->update($attributes);
        return $record->fresh();
    }

    /**
     * @inheritDoc
     */
    public function delete(int|string $id): bool
    {
        $record = $this->model->findOrFail($id);
        return (bool) $record->delete();
    }
}

<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Repositories\Interfaces\InventoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Class InventoryService
 * Service layer for Inventory & Stock management.
 */
class InventoryService
{
    public function __construct(
        protected InventoryRepositoryInterface $inventoryRepository
    ) {}

    public function getPaginated(
        int $perPage = 15,
        ?string $search = null,
        string $sortBy = 'id',
        string $sortOrder = 'desc',
        array $filters = []
    ): LengthAwarePaginator {
        return $this->inventoryRepository->getPaginated(
            perPage: $perPage,
            relations: ['transactions.supplier'],
            search: $search,
            searchableFields: ['item_name', 'sku'],
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );
    }

    public function createInventory(array $data): Inventory
    {
        /** @var Inventory $inventory */
        $inventory = $this->inventoryRepository->create($data);
        return $inventory;
    }

    public function recordTransaction(array $data): InventoryTransaction
    {
        return DB::transaction(function () use ($data) {
            $inventory = $this->inventoryRepository->findById($data['inventory_id']);

            if (!$inventory) {
                throw ValidationException::withMessages([
                    'inventory_id' => ['Inventory item not found.'],
                ]);
            }

            $type = $data['type'];
            $qty = (float) $data['quantity'];

            if ($type === 'in') {
                $inventory->increment('stock_quantity', $qty);
            } elseif ($type === 'out') {
                if ($inventory->stock_quantity < $qty) {
                    throw ValidationException::withMessages([
                        'quantity' => ["Insufficient stock to record 'out' transaction. Current stock: {$inventory->stock_quantity}."],
                    ]);
                }
                $inventory->decrement('stock_quantity', $qty);
            } elseif ($type === 'adjustment') {
                $inventory->update(['stock_quantity' => $qty]);
            }

            return InventoryTransaction::create([
                'inventory_id' => $inventory->id,
                'supplier_id' => $data['supplier_id'] ?? null,
                'type' => $type,
                'quantity' => $qty,
                'unit_price' => $data['unit_price'] ?? null,
                'notes' => $data['notes'] ?? null,
            ])->load(['inventory', 'supplier']);
        });
    }

    public function getInventoryById(int|string $id): Inventory
    {
        $inventory = $this->inventoryRepository->findById($id, ['transactions.supplier']);

        if (!$inventory) {
            abort(404, 'Inventory item not found.');
        }

        return $inventory;
    }
}

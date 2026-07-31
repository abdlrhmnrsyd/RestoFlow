<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Inventory;
use App\Models\User;

/**
 * Class InventoryPolicy
 * Authorization policy for Inventory resource.
 */
class InventoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::INVENTORY_VIEW->value);
    }

    public function view(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo(PermissionEnum::INVENTORY_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::INVENTORY_MANAGE->value);
    }

    public function update(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo(PermissionEnum::INVENTORY_MANAGE->value);
    }

    public function delete(User $user, Inventory $inventory): bool
    {
        return $user->hasPermissionTo(PermissionEnum::INVENTORY_MANAGE->value);
    }
}

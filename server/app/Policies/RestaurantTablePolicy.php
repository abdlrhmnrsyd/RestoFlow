<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\RestaurantTable;
use App\Models\User;

/**
 * Class RestaurantTablePolicy
 * Security policy for RestaurantTable resource.
 */
class RestaurantTablePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::TABLE_VIEW->value);
    }

    public function view(User $user, RestaurantTable $table): bool
    {
        return $user->hasPermissionTo(PermissionEnum::TABLE_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::TABLE_CREATE->value);
    }

    public function update(User $user, RestaurantTable $table): bool
    {
        return $user->hasPermissionTo(PermissionEnum::TABLE_UPDATE->value);
    }

    public function delete(User $user, RestaurantTable $table): bool
    {
        return $user->hasPermissionTo(PermissionEnum::TABLE_DELETE->value);
    }
}

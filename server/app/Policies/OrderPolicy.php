<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Order;
use App\Models\User;

/**
 * Class OrderPolicy
 * Authorization policy for Order resource.
 */
class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ORDER_VIEW->value);
    }

    public function view(User $user, Order $order): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ORDER_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ORDER_CREATE->value);
    }

    public function update(User $user, Order $order): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ORDER_UPDATE->value)
            || $user->hasPermissionTo(PermissionEnum::ORDER_COOK->value);
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ORDER_DELETE->value);
    }
}

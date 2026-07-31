<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Menu;
use App\Models\User;

/**
 * Class MenuPolicy
 * Authorization policy for Menu resource.
 */
class MenuPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::MENU_VIEW->value);
    }

    public function view(User $user, Menu $menu): bool
    {
        return $user->hasPermissionTo(PermissionEnum::MENU_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::MENU_CREATE->value);
    }

    public function update(User $user, Menu $menu): bool
    {
        return $user->hasPermissionTo(PermissionEnum::MENU_UPDATE->value);
    }

    public function delete(User $user, Menu $menu): bool
    {
        return $user->hasPermissionTo(PermissionEnum::MENU_DELETE->value);
    }
}

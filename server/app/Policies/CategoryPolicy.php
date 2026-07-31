<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Category;
use App\Models\User;

/**
 * Class CategoryPolicy
 * Security policy authorization for Category resource.
 */
class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::CATEGORY_VIEW->value);
    }

    public function view(User $user, Category $category): bool
    {
        return $user->hasPermissionTo(PermissionEnum::CATEGORY_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::CATEGORY_CREATE->value);
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasPermissionTo(PermissionEnum::CATEGORY_UPDATE->value);
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasPermissionTo(PermissionEnum::CATEGORY_DELETE->value);
    }
}

<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Class RolePermissionService
 * Business logic for Role & Permission management.
 */
class RolePermissionService
{
    /**
     * RolePermissionService constructor.
     *
     * @param UserRepositoryInterface $userRepository
     */
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get all roles with their associated permissions.
     *
     * @return Collection
     */
    public function getRoles(): Collection
    {
        return Role::with('permissions')->get();
    }

    /**
     * Get all registered system permissions.
     *
     * @return Collection
     */
    public function getPermissions(): Collection
    {
        return Permission::all();
    }

    /**
     * Assign a specific role to a user.
     *
     * @param int|string $userId
     * @param string $roleName
     * @return User
     */
    public function assignRoleToUser(int|string $userId, string $roleName): User
    {
        /** @var User $user */
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            abort(404, 'User not found.');
        }

        $user->syncRoles([$roleName]);

        return $user->fresh(['roles', 'permissions']);
    }
}

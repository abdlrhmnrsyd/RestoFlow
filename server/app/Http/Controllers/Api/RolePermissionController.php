<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AssignRoleRequest;
use App\Http\Resources\UserResource;
use App\Services\RolePermissionService;
use Illuminate\Http\JsonResponse;

/**
 * Class RolePermissionController
 * @package App\Http\Controllers\Api
 * 
 * Endpoints for querying available roles & permissions and assigning roles to users.
 */
class RolePermissionController extends Controller
{
    /**
     * RolePermissionController constructor.
     *
     * @param RolePermissionService $rolePermissionService
     */
    public function __construct(
        protected RolePermissionService $rolePermissionService
    ) {}

    /**
     * List all system roles with assigned permissions.
     *
     * @return JsonResponse
     */
    public function roles(): JsonResponse
    {
        $roles = $this->rolePermissionService->getRoles();

        return $this->successResponse($roles, 'Roles retrieved successfully.');
    }

    /**
     * List all system permissions.
     *
     * @return JsonResponse
     */
    public function permissions(): JsonResponse
    {
        $permissions = $this->rolePermissionService->getPermissions();

        return $this->successResponse($permissions, 'Permissions retrieved successfully.');
    }

    /**
     * Assign a role to a specified user.
     *
     * @param AssignRoleRequest $request
     * @param int|string $id
     * @return JsonResponse
     */
    public function assignRole(AssignRoleRequest $request, int|string $id): JsonResponse
    {
        $user = $this->rolePermissionService->assignRoleToUser($id, $request->validated('role'));

        return $this->successResponse(
            new UserResource($user),
            'Role assigned successfully.'
        );
    }
}

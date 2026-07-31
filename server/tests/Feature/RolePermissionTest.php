<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_admin_can_get_list_of_roles_and_permissions(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::ADMIN->value);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/roles');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Roles retrieved successfully.',
            ]);

        $permissionsResponse = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/permissions');

        $permissionsResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permissions retrieved successfully.',
            ]);
    }

    public function test_unauthorized_user_cannot_access_roles(): void
    {
        $waiter = User::factory()->create();
        $waiter->assignRole(UserRole::WAITER->value);

        $response = $this->actingAs($waiter, 'sanctum')
            ->getJson('/api/v1/roles');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'User does not have the right permissions.',
            ]);
    }

    public function test_admin_can_assign_role_to_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(UserRole::ADMIN->value);

        $targetUser = User::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/users/{$targetUser->id}/assign-role", [
                'role' => UserRole::CASHIER->value,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Role assigned successfully.',
            ]);

        $this->assertTrue($targetUser->fresh()->hasRole(UserRole::CASHIER->value));
    }
}

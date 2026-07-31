<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $kitchen;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(UserRole::ADMIN->value);

        $this->kitchen = User::factory()->create();
        $this->kitchen->assignRole(UserRole::KITCHEN->value);
    }

    public function test_admin_can_access_dashboard_stats(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/dashboard/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_revenue' => 0,
                    'today_orders' => 0,
                ],
            ]);
    }

    public function test_kitchen_cannot_access_dashboard_stats(): void
    {
        $response = $this->actingAs($this->kitchen, 'sanctum')
            ->getJson('/api/v1/dashboard/stats');

        $response->assertStatus(403);
    }
}

<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\RestaurantTable;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RestaurantTableTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(UserRole::ADMIN->value);
    }

    public function test_admin_can_list_restaurant_tables(): void
    {
        RestaurantTable::factory()->count(3)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/restaurant-tables');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Restaurant tables retrieved successfully.',
            ]);
    }

    public function test_admin_can_create_restaurant_table(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/restaurant-tables', [
                'table_number' => 'T-99',
                'capacity' => 6,
                'status' => 'available',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'table_number' => 'T-99',
                    'capacity' => 6,
                ],
            ]);

        $this->assertDatabaseHas('restaurant_tables', ['table_number' => 'T-99']);
    }
}

<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Menu;
use App\Models\RestaurantTable;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected RestaurantTable $table;
    protected Menu $menu;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(UserRole::ADMIN->value);

        $category = Category::factory()->create();
        $this->table = RestaurantTable::factory()->create(['table_number' => 'T-01', 'status' => 'available']);
        $this->menu = Menu::factory()->create([
            'category_id' => $category->id,
            'name' => 'Pizza Margherita',
            'price' => 100000,
            'stock' => 20,
            'is_available' => true,
        ]);
    }

    public function test_user_can_create_order(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/orders', [
                'restaurant_table_id' => $this->table->id,
                'customer_name' => 'John Doe',
                'items' => [
                    [
                        'menu_id' => $this->menu->id,
                        'quantity' => 2,
                        'notes' => 'Extra cheese',
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'customer_name' => 'John Doe',
                    'total_amount' => 200000,
                    'tax_amount' => 20000,
                    'service_charge' => 10000,
                    'final_amount' => 230000,
                ],
            ]);

        $this->assertEquals('occupied', $this->table->fresh()->status);
        $this->assertEquals(18, $this->menu->fresh()->stock);
    }
}

<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\RestaurantTable;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(UserRole::ADMIN->value);

        $table = RestaurantTable::factory()->create(['status' => 'occupied']);
        $category = Category::factory()->create();
        $menu = Menu::factory()->create(['category_id' => $category->id, 'price' => 50000]);

        $this->order = Order::create([
            'order_number' => 'ORD-TEST-001',
            'restaurant_table_id' => $table->id,
            'user_id' => $this->admin->id,
            'customer_name' => 'Alice',
            'status' => 'pending',
            'total_amount' => 50000,
            'tax_amount' => 5000,
            'service_charge' => 2500,
            'final_amount' => 57500,
        ]);
    }

    public function test_cashier_or_admin_can_process_payment(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/payments', [
                'order_id' => $this->order->id,
                'amount_paid' => 100000,
                'payment_method' => 'cash',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'amount_paid' => 100000,
                    'change_amount' => 42500,
                    'status' => 'success',
                ],
            ]);

        $this->assertEquals('completed', $this->order->fresh()->status);
        $this->assertEquals('available', $this->order->restaurantTable->fresh()->status);
    }
}

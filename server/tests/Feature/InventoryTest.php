<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Inventory;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryTest extends TestCase
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

    public function test_admin_can_create_inventory_and_record_stock_in(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/inventories', [
                'item_name' => 'Wagyu Beef Ribeye',
                'sku' => 'BEEF-WAGYU-01',
                'unit' => 'kg',
                'stock_quantity' => 10,
                'min_stock_alert' => 2,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'sku' => 'BEEF-WAGYU-01',
                    'stock_quantity' => 10,
                ],
            ]);

        $inventoryId = $response->json('data.id');

        $txResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/inventories/transactions', [
                'inventory_id' => $inventoryId,
                'type' => 'in',
                'quantity' => 15,
                'unit_price' => 200000,
                'notes' => 'Received fresh batch',
            ]);

        $txResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'type' => 'in',
                    'quantity' => 15,
                ],
            ]);

        $this->assertEquals(25, Inventory::find($inventoryId)->stock_quantity);
    }
}

<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Menu;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(UserRole::ADMIN->value);

        $this->category = Category::factory()->create();
    }

    public function test_user_can_list_menus(): void
    {
        Menu::factory()->count(3)->create(['category_id' => $this->category->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/menus');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Menus retrieved successfully.',
            ]);
    }

    public function test_admin_can_create_menu(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/menus', [
                'category_id' => $this->category->id,
                'name' => 'Grilled Chicken Salad',
                'description' => 'Fresh healthy salad.',
                'price' => 45000,
                'stock' => 50,
                'is_available' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Grilled Chicken Salad',
                    'price' => 45000,
                ],
            ]);

        $this->assertDatabaseHas('menus', ['name' => 'Grilled Chicken Salad']);
    }

    public function test_admin_can_update_menu(): void
    {
        $menu = Menu::factory()->create(['category_id' => $this->category->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/menus/{$menu->id}", [
                'category_id' => $this->category->id,
                'name' => 'Updated Menu Name',
                'price' => 55000,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Updated Menu Name',
                    'price' => 55000,
                ],
            ]);
    }

    public function test_admin_can_delete_menu(): void
    {
        $menu = Menu::factory()->create(['category_id' => $this->category->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/menus/{$menu->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Menu item deleted successfully.',
            ]);

        $this->assertSoftDeleted('menus', ['id' => $menu->id]);
    }
}

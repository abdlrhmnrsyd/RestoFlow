<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Class RoleAndPermissionSeeder
 * Seeds default roles and permissions for RestoFlow.
 */
class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        foreach (PermissionEnum::cases() as $permission) {
            Permission::findOrCreate($permission->value, 'web');
        }

        // Create Roles and Assign Permissions

        // 1. Admin Role (Gets all permissions)
        $adminRole = Role::findOrCreate(UserRole::ADMIN->value, 'web');
        $adminRole->syncPermissions(PermissionEnum::values());

        // 2. Manager Role
        $managerRole = Role::findOrCreate(UserRole::MANAGER->value, 'web');
        $managerRole->syncPermissions([
            PermissionEnum::CATEGORY_VIEW->value,
            PermissionEnum::CATEGORY_CREATE->value,
            PermissionEnum::CATEGORY_UPDATE->value,
            PermissionEnum::CATEGORY_DELETE->value,
            PermissionEnum::MENU_VIEW->value,
            PermissionEnum::MENU_CREATE->value,
            PermissionEnum::MENU_UPDATE->value,
            PermissionEnum::MENU_DELETE->value,
            PermissionEnum::TABLE_VIEW->value,
            PermissionEnum::TABLE_CREATE->value,
            PermissionEnum::TABLE_UPDATE->value,
            PermissionEnum::TABLE_DELETE->value,
            PermissionEnum::ORDER_VIEW->value,
            PermissionEnum::ORDER_CREATE->value,
            PermissionEnum::ORDER_UPDATE->value,
            PermissionEnum::ORDER_DELETE->value,
            PermissionEnum::PAYMENT_VIEW->value,
            PermissionEnum::PAYMENT_CREATE->value,
            PermissionEnum::PAYMENT_UPDATE->value,
            PermissionEnum::INVENTORY_VIEW->value,
            PermissionEnum::INVENTORY_MANAGE->value,
            PermissionEnum::DASHBOARD_VIEW->value,
        ]);

        // 3. Cashier Role
        $cashierRole = Role::findOrCreate(UserRole::CASHIER->value, 'web');
        $cashierRole->syncPermissions([
            PermissionEnum::CATEGORY_VIEW->value,
            PermissionEnum::MENU_VIEW->value,
            PermissionEnum::TABLE_VIEW->value,
            PermissionEnum::ORDER_VIEW->value,
            PermissionEnum::ORDER_CREATE->value,
            PermissionEnum::ORDER_UPDATE->value,
            PermissionEnum::PAYMENT_VIEW->value,
            PermissionEnum::PAYMENT_CREATE->value,
        ]);

        // 4. Waiter Role
        $waiterRole = Role::findOrCreate(UserRole::WAITER->value, 'web');
        $waiterRole->syncPermissions([
            PermissionEnum::CATEGORY_VIEW->value,
            PermissionEnum::MENU_VIEW->value,
            PermissionEnum::TABLE_VIEW->value,
            PermissionEnum::ORDER_VIEW->value,
            PermissionEnum::ORDER_CREATE->value,
            PermissionEnum::ORDER_UPDATE->value,
        ]);

        // 5. Kitchen Role
        $kitchenRole = Role::findOrCreate(UserRole::KITCHEN->value, 'web');
        $kitchenRole->syncPermissions([
            PermissionEnum::ORDER_VIEW->value,
            PermissionEnum::ORDER_COOK->value,
        ]);
    }
}

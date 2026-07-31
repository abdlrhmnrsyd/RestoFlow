<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Class UserSeeder
 * Seeds initial system users with assigned roles.
 */
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        $users = [
            [
                'name' => 'System Admin',
                'email' => 'admin@restoflow.com',
                'phone' => '081100000001',
                'role' => UserRole::ADMIN->value,
            ],
            [
                'name' => 'Restaurant Manager',
                'email' => 'manager@restoflow.com',
                'phone' => '081100000002',
                'role' => UserRole::MANAGER->value,
            ],
            [
                'name' => 'Main Cashier',
                'email' => 'cashier@restoflow.com',
                'phone' => '081100000003',
                'role' => UserRole::CASHIER->value,
            ],
            [
                'name' => 'Head Waiter',
                'email' => 'waiter@restoflow.com',
                'phone' => '081100000004',
                'role' => UserRole::WAITER->value,
            ],
            [
                'name' => 'Chef Kitchen',
                'email' => 'kitchen@restoflow.com',
                'phone' => '081100000005',
                'role' => UserRole::KITCHEN->value,
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => $defaultPassword,
                    'is_active' => true,
                ])
            );

            $user->syncRoles([$role]);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\RestaurantTable;
use Illuminate\Database\Seeder;

/**
 * Class RestaurantTableSeeder
 * Seeds initial tables in the restaurant layout.
 */
class RestaurantTableSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [
            ['table_number' => 'T-01', 'capacity' => 2, 'status' => 'available'],
            ['table_number' => 'T-02', 'capacity' => 2, 'status' => 'available'],
            ['table_number' => 'T-03', 'capacity' => 4, 'status' => 'available'],
            ['table_number' => 'T-04', 'capacity' => 4, 'status' => 'available'],
            ['table_number' => 'VIP-01', 'capacity' => 8, 'status' => 'available'],
        ];

        foreach ($tables as $tbl) {
            RestaurantTable::firstOrCreate(
                ['table_number' => $tbl['table_number']],
                $tbl
            );
        }
    }
}

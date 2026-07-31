<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Class CategorySeeder
 * Seeds initial restaurant categories.
 */
class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Main Course', 'description' => 'Hearty main dishes and traditional meals.'],
            ['name' => 'Appetizers', 'description' => 'Delicious starters and finger foods.'],
            ['name' => 'Beverages', 'description' => 'Hot & cold drinks, juices, and coffee.'],
            ['name' => 'Desserts', 'description' => 'Sweet treats, cakes, and ice creams.'],
            ['name' => 'Side Dishes', 'description' => 'Extra sides, rice, and snacks.'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'is_active' => true,
                ]
            );
        }
    }
}

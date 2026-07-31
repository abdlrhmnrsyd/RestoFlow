<?php

namespace Database\Factories;

use App\Models\RestaurantTable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RestaurantTable>
 */
class RestaurantTableFactory extends Factory
{
    protected $model = RestaurantTable::class;

    public function definition(): array
    {
        return [
            'table_number' => 'T-' . $this->faker->unique()->numberBetween(100, 999),
            'capacity' => $this->faker->randomElement([2, 4, 6, 8, 10]),
            'status' => 'available',
        ];
    }
}

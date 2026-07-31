<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Class MenuSeeder
 * Seeds initial menu items with food image URLs linked to categories.
 */
class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $mainCourse = Category::where('slug', 'main-course')->first();
        $beverages = Category::where('slug', 'beverages')->first();
        $desserts = Category::where('slug', 'desserts')->first();
        $appetizers = Category::where('slug', 'appetizers')->first();

        $menus = [
            [
                'category_id' => $mainCourse?->id ?? 1,
                'name' => 'Wagyu Beef Steak',
                'description' => 'Tender Wagyu beef served with truffle sauce and roasted potato wedges.',
                'price' => 250000,
                'stock' => 25,
                'image_url' => 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'category_id' => $mainCourse?->id ?? 1,
                'name' => 'Nasi Goreng Special RestoFlow',
                'description' => 'Indonesian fried rice with chicken, prawn, sunny side egg and satay.',
                'price' => 65000,
                'stock' => 50,
                'image_url' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'category_id' => $mainCourse?->id ?? 1,
                'name' => 'Spaghetti Creamy Carbonara',
                'description' => 'Classic Italian pasta with crispy bacon, parmesan cheese and rich egg cream.',
                'price' => 85000,
                'stock' => 35,
                'image_url' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'category_id' => $appetizers?->id ?? 2,
                'name' => 'Crispy Truffle Fries',
                'description' => 'Golden potato fries tossed in aromatic truffle oil and grated parmesan.',
                'price' => 42000,
                'stock' => 60,
                'image_url' => 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'category_id' => $beverages?->id ?? 3,
                'name' => 'Iced Matcha Latte',
                'description' => 'Premium Japanese Uji matcha blended with fresh organic milk.',
                'price' => 38000,
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'category_id' => $beverages?->id ?? 3,
                'name' => 'Fresh Mango Fruit Smoothie',
                'description' => 'Refreshing blend of fresh Alphonso mangoes and natural honey.',
                'price' => 35000,
                'stock' => 80,
                'image_url' => 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'category_id' => $desserts?->id ?? 4,
                'name' => 'Molten Chocolate Lava Cake',
                'description' => 'Warm Belgian chocolate cake with oozing center, served with vanilla ice cream.',
                'price' => 45000,
                'stock' => 30,
                'image_url' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
            ],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(
                ['slug' => Str::slug($menu['name'])],
                array_merge($menu, [
                    'is_available' => true,
                ])
            );
        }
    }
}

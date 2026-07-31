<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Order
 * @package App\Models
 * 
 * @property int $id
 * @property string $order_number
 * @property int|null $restaurant_table_id
 * @property int $user_id
 * @property string|null $customer_name
 * @property string $status
 * @property float $total_amount
 * @property float $tax_amount
 * @property float $service_charge
 * @property float $final_amount
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'restaurant_table_id',
        'user_id',
        'customer_name',
        'status',
        'total_amount',
        'tax_amount',
        'service_charge',
        'final_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'float',
            'tax_amount' => 'float',
            'service_charge' => 'float',
            'final_amount' => 'float',
        ];
    }

    public function restaurantTable(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Inventory
 * @package App\Models
 * 
 * @property int $id
 * @property string $item_name
 * @property string $sku
 * @property string $unit
 * @property float $stock_quantity
 * @property float $min_stock_alert
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name',
        'sku',
        'unit',
        'stock_quantity',
        'min_stock_alert',
    ];

    protected function casts(): array
    {
        return [
            'stock_quantity' => 'float',
            'min_stock_alert' => 'float',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }
}

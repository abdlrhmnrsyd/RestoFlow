<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class InventoryResource
 * API Resource for Inventory.
 */
class InventoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_name' => $this->item_name,
            'sku' => $this->sku,
            'unit' => $this->unit,
            'stock_quantity' => (float) $this->stock_quantity,
            'min_stock_alert' => (float) $this->min_stock_alert,
            'is_low_stock' => (bool) ($this->stock_quantity <= $this->min_stock_alert),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

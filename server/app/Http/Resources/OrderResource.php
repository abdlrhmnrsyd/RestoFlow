<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class OrderResource
 * Transmogrifies Order into standardized JSON.
 */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'restaurant_table_id' => $this->restaurant_table_id,
            'restaurant_table' => new RestaurantTableResource($this->whenLoaded('restaurantTable')),
            'user' => new UserResource($this->whenLoaded('user')),
            'customer_name' => $this->customer_name,
            'status' => $this->status,
            'total_amount' => (float) $this->total_amount,
            'tax_amount' => (float) $this->tax_amount,
            'service_charge' => (float) $this->service_charge,
            'final_amount' => (float) $this->final_amount,
            'notes' => $this->notes,
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

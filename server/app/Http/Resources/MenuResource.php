<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class MenuResource
 * API Resource transformation for Menu.
 */
class MenuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imageUrl = null;
        if ($this->image_url) {
            $imageUrl = str_starts_with($this->image_url, 'http://') || str_starts_with($this->image_url, 'https://')
                ? $this->image_url
                : asset('storage/' . $this->image_url);
        }

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'image_url' => $imageUrl,
            'is_available' => (bool) $this->is_available,
            'stock' => (int) $this->stock,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

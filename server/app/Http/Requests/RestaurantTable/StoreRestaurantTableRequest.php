<?php

namespace App\Http\Requests\RestaurantTable;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class StoreRestaurantTableRequest
 * Validates creating a new restaurant table.
 */
class StoreRestaurantTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'table_number' => ['required', 'string', 'max:50', 'unique:restaurant_tables,table_number'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'string', Rule::in(['available', 'occupied', 'reserved'])],
        ];
    }
}

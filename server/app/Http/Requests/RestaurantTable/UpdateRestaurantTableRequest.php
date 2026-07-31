<?php

namespace App\Http\Requests\RestaurantTable;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateRestaurantTableRequest
 * Validates updating a restaurant table.
 */
class UpdateRestaurantTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tableId = $this->route('restaurant_table');

        return [
            'table_number' => ['required', 'string', 'max:50', Rule::unique('restaurant_tables', 'table_number')->ignore($tableId)],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'string', Rule::in(['available', 'occupied', 'reserved'])],
        ];
    }
}

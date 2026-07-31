<?php

namespace App\Enums;

/**
 * Enum UserRole
 * Represents standard user roles in RestoFlow.
 */
enum UserRole: string
{
    case ADMIN = 'Admin';
    case MANAGER = 'Manager';
    case CASHIER = 'Cashier';
    case WAITER = 'Waiter';
    case KITCHEN = 'Kitchen';

    /**
     * Get all role values as an array.
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

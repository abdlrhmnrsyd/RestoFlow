<?php

namespace App\Enums;

/**
 * Enum PermissionEnum
 * Represents system permissions across all modules.
 */
enum PermissionEnum: string
{
    // Category Permissions
    case CATEGORY_VIEW = 'category-view';
    case CATEGORY_CREATE = 'category-create';
    case CATEGORY_UPDATE = 'category-update';
    case CATEGORY_DELETE = 'category-delete';

    // Menu Permissions
    case MENU_VIEW = 'menu-view';
    case MENU_CREATE = 'menu-create';
    case MENU_UPDATE = 'menu-update';
    case MENU_DELETE = 'menu-delete';

    // Table Permissions
    case TABLE_VIEW = 'table-view';
    case TABLE_CREATE = 'table-create';
    case TABLE_UPDATE = 'table-update';
    case TABLE_DELETE = 'table-delete';

    // Order Permissions
    case ORDER_VIEW = 'order-view';
    case ORDER_CREATE = 'order-create';
    case ORDER_UPDATE = 'order-update';
    case ORDER_DELETE = 'order-delete';
    case ORDER_COOK = 'order-cook';

    // Payment Permissions
    case PAYMENT_VIEW = 'payment-view';
    case PAYMENT_CREATE = 'payment-create';
    case PAYMENT_UPDATE = 'payment-update';

    // Inventory & Supplier Permissions
    case INVENTORY_VIEW = 'inventory-view';
    case INVENTORY_MANAGE = 'inventory-manage';

    // Dashboard & Reports Permissions
    case DASHBOARD_VIEW = 'dashboard-view';

    // User & Security Permissions
    case USER_MANAGE = 'user-manage';

    /**
     * Get all permission values.
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

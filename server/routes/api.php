<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\MidtransController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PublicOrderController;
use App\Http\Controllers\Api\RestaurantTableController;
use App\Http\Controllers\Api\RolePermissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - RestoFlow Backend (v1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Health Check Endpoint
    Route::get('/health', [HealthCheckController::class, 'index']);

    // Public QR Code Customer Self-Ordering Routes
    Route::prefix('public')->group(function () {
        Route::get('/tables/{tableNumber}', [PublicOrderController::class, 'getTableInfo']);
        Route::get('/menus', [PublicOrderController::class, 'getMenus']);
        Route::post('/orders', [PublicOrderController::class, 'storeOrder']);
        Route::get('/orders/{id}/status', [PublicOrderController::class, 'getOrderStatus']);
        Route::post('/orders/{id}/confirm-payment', [PublicOrderController::class, 'confirmPayment']);
    });

    // Midtrans Payment Gateway Webhook & Snap Token Routes
    Route::prefix('payments/midtrans')->group(function () {
        Route::post('/snap-token', [MidtransController::class, 'getSnapToken']);
        Route::post('/notification', [MidtransController::class, 'handleNotification']);
    });

    // Authentication Routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
            Route::put('/change-password', [AuthController::class, 'changePassword']);
        });
    });

    // Role & Permission Routes (Protected)
    Route::middleware(['auth:sanctum', 'permission:user-manage'])->group(function () {
        Route::get('/roles', [RolePermissionController::class, 'roles']);
        Route::get('/permissions', [RolePermissionController::class, 'permissions']);
        Route::post('/users/{id}/assign-role', [RolePermissionController::class, 'assignRole']);
    });

    // Module Resource Routes (Protected)
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('menus', MenuController::class);
        Route::apiResource('restaurant-tables', RestaurantTableController::class);
        
        // Orders
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::apiResource('orders', OrderController::class);

        // Payments
        Route::apiResource('payments', PaymentController::class)->only(['index', 'store', 'show']);

        // Dashboard
        Route::prefix('dashboard')->group(function () {
            Route::get('/stats', [DashboardController::class, 'stats']);
            Route::get('/popular-menus', [DashboardController::class, 'popularMenus']);
            Route::get('/sales-chart', [DashboardController::class, 'salesChart']);
        });

        // Inventory & Transactions
        Route::post('/inventories/transactions', [InventoryController::class, 'recordTransaction']);
        Route::apiResource('inventories', InventoryController::class)->only(['index', 'store', 'show']);
    });
});
<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\RestaurantTable;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

/**
 * Class MidtransService
 * @package App\Services
 * 
 * Handles Midtrans Snap Token generation and Webhook Notification callback processing.
 */
class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.is_production', false);
        Config::$isSanitized = config('midtrans.is_sanitized', true);
        Config::$is3ds = config('midtrans.is_3ds', true);
    }

    /**
     * Generate Midtrans Snap Token for an Order.
     *
     * @param Order $order
     * @return array
     * @throws Exception
     */
    public function createSnapToken(Order $order): array
    {
        $order->load(['orderItems.menu', 'user', 'restaurantTable']);

        $items = [];
        foreach ($order->orderItems as $item) {
            $items[] = [
                'id' => (string) $item->menu_id,
                'price' => (int) $item->unit_price,
                'quantity' => (int) $item->quantity,
                'name' => Str::limit($item->menu?->name ?? 'Dish Item', 50),
            ];
        }

        if ($order->tax_amount > 0) {
            $items[] = [
                'id' => 'TAX-PB1',
                'price' => (int) $order->tax_amount,
                'quantity' => 1,
                'name' => 'Tax PB1 (10%)',
            ];
        }

        if ($order->service_charge > 0) {
            $items[] = [
                'id' => 'SERVICE-FEE',
                'price' => (int) $order->service_charge,
                'quantity' => 1,
                'name' => 'Service Charge (5%)',
            ];
        }

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number . '-' . time(),
                'gross_amount' => (int) $order->final_amount,
            ],
            'customer_details' => [
                'first_name' => $order->customer_name ?: 'Customer',
                'email' => $order->user?->email ?: 'customer@restoflow.com',
                'phone' => $order->user?->phone ?: '08123456789',
            ],
            'item_details' => $items,
        ];

        // Check if server key is a placeholder or default key
        $serverKey = config('midtrans.server_key');
        $isDemoKey = str_contains($serverKey, 'DemoKey') || str_contains($serverKey, 'placeholder') || strlen($serverKey) < 10;

        if ($isDemoKey) {
            $mockToken = 'SNAP-DEMO-' . strtoupper(Str::random(16));
            return [
                'snap_token' => $mockToken,
                'order_number' => $order->order_number,
                'gross_amount' => $order->final_amount,
                'is_demo' => true,
                'message' => 'Simulasi Midtrans QRIS (Set real MIDTRANS_SERVER_KEY di file .env untuk koneksi Midtrans Sandbox/Production).',
            ];
        }

        try {
            $snapToken = Snap::getSnapToken($params);

            return [
                'snap_token' => $snapToken,
                'order_number' => $order->order_number,
                'gross_amount' => $order->final_amount,
                'is_demo' => false,
            ];
        } catch (Exception $e) {
            Log::warning('Midtrans API fallback mode activated: ' . $e->getMessage());

            $mockToken = 'SNAP-DEMO-' . strtoupper(Str::random(16));
            return [
                'snap_token' => $mockToken,
                'order_number' => $order->order_number,
                'gross_amount' => $order->final_amount,
                'is_demo' => true,
                'message' => 'Key Midtrans belum aktif. Menggunakan simulasi QRIS RestoFlow.',
            ];
        }
    }

    /**
     * Handle incoming Midtrans Webhook Notification callback.
     *
     * @param array $payload
     * @return bool
     */
    public function handleNotification(array $payload): bool
    {
        $orderIdParam = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $paymentType = $payload['payment_type'] ?? 'midtrans';

        if (!$orderIdParam || !$signatureKey) {
            return false;
        }

        // Verify SHA512 signature
        $serverKey = config('midtrans.server_key');
        $expectedSignature = hash("sha512", $orderIdParam . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $expectedSignature) {
            Log::warning("Midtrans Invalid Signature Key for Order {$orderIdParam}");
            return false;
        }

        // Extract raw order number before timestamp prefix
        $orderPrefix = explode('-', $orderIdParam)[0] . '-' . (explode('-', $orderIdParam)[1] ?? '');
        $order = Order::where('order_number', 'LIKE', $orderPrefix . '-%')->first();

        if (!$order) {
            Log::error("Midtrans Order not found for {$orderIdParam}");
            return false;
        }

        if (in_array($transactionStatus, ['settlement', 'capture'])) {
            // Create or update payment record
            Payment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'payment_number' => 'PMT-MIDTRANS-' . strtoupper(Str::random(6)),
                    'amount_paid' => (float) $grossAmount,
                    'change_amount' => 0,
                    'payment_method' => 'midtrans_' . $paymentType,
                    'status' => 'completed',
                ]
            );

            // Update order status
            $order->update(['status' => 'completed']);

            // Free up table if assigned
            if ($order->restaurant_table_id) {
                RestaurantTable::where('id', $order->restaurant_table_id)->update(['status' => 'available']);
            }

            Log::info("Order {$order->order_number} marked as COMPLETED via Midtrans.");
            return true;
        }

        return false;
    }
}

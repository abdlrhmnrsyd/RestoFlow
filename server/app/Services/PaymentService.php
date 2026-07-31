<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\RestaurantTable;
use App\Repositories\Interfaces\PaymentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Class PaymentService
 * Service layer for Payment processing.
 */
class PaymentService
{
    public function __construct(
        protected PaymentRepositoryInterface $paymentRepository
    ) {}

    public function getPaginated(
        int $perPage = 15,
        ?string $search = null,
        string $sortBy = 'id',
        string $sortOrder = 'desc',
        array $filters = []
    ): LengthAwarePaginator {
        return $this->paymentRepository->getPaginated(
            perPage: $perPage,
            relations: ['order.restaurantTable', 'order.user'],
            search: $search,
            searchableFields: ['payment_number'],
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );
    }

    public function processPayment(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            $order = Order::find($data['order_id']);

            if (!$order) {
                throw ValidationException::withMessages([
                    'order_id' => ['Order not found.'],
                ]);
            }

            if ($order->status === 'completed') {
                throw ValidationException::withMessages([
                    'order_id' => ['This order has already been paid and completed.'],
                ]);
            }

            if ($order->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'order_id' => ['Cannot pay for a cancelled order.'],
                ]);
            }

            if ($data['amount_paid'] < $order->final_amount) {
                throw ValidationException::withMessages([
                    'amount_paid' => ["Amount paid (Rp {$data['amount_paid']}) is less than total bill (Rp {$order->final_amount})."],
                ]);
            }

            $changeAmount = $data['amount_paid'] - $order->final_amount;
            $paymentNumber = 'PAY-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

            /** @var Payment $payment */
            $payment = $this->paymentRepository->create([
                'order_id' => $order->id,
                'payment_number' => $paymentNumber,
                'amount_paid' => $data['amount_paid'],
                'change_amount' => $changeAmount,
                'payment_method' => $data['payment_method'],
                'status' => 'success',
                'paid_at' => now(),
            ]);

            // Update order status to completed
            $order->update(['status' => 'completed']);

            // Release table to available
            if ($order->restaurant_table_id) {
                RestaurantTable::where('id', $order->restaurant_table_id)->update(['status' => 'available']);
            }

            return $payment->load('order.orderItems.menu');
        });
    }

    public function getPaymentById(int|string $id): Payment
    {
        $payment = $this->paymentRepository->findById($id, ['order.orderItems.menu', 'order.user', 'order.restaurantTable']);

        if (!$payment) {
            abort(404, 'Payment record not found.');
        }

        return $payment;
    }
}

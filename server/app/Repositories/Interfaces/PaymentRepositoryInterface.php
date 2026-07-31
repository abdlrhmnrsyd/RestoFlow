<?php

namespace App\Repositories\Interfaces;

use App\Models\Payment;

/**
 * Interface PaymentRepositoryInterface
 * Contract for Payment repository operations.
 */
interface PaymentRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find payment by payment number.
     *
     * @param string $paymentNumber
     * @return Payment|null
     */
    public function findByPaymentNumber(string $paymentNumber): ?Payment;
}

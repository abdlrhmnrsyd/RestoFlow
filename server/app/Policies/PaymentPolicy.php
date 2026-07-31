<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Payment;
use App\Models\User;

/**
 * Class PaymentPolicy
 * Authorization policy for Payment resource.
 */
class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::PAYMENT_VIEW->value);
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo(PermissionEnum::PAYMENT_VIEW->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::PAYMENT_CREATE->value);
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo(PermissionEnum::PAYMENT_UPDATE->value);
    }
}

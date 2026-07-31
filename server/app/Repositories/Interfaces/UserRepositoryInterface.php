<?php

namespace App\Repositories\Interfaces;

use App\Models\User;

/**
 * Interface UserRepositoryInterface
 * Contract for User repository operations.
 */
interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find user by email address.
     *
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User;
}

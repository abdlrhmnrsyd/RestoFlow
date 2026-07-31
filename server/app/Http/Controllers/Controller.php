<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * Class Controller
 * Base controller for RestoFlow backend API.
 */
abstract class Controller
{
    use ApiResponse, AuthorizesRequests;
}
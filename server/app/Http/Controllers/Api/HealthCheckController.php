<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Class HealthCheckController
 * @package App\Http\Controllers\Api
 * 
 * Provides an endpoint to verify system status and API response standard consistency.
 */
class HealthCheckController extends Controller
{
    /**
     * Display System Health Status.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return $this->successResponse([
            'system' => 'RestoFlow API',
            'version' => '1.0.0',
            'framework' => 'Laravel 13',
            'status' => 'Healthy',
            'timestamp' => now()->toIso8601String(),
        ], 'RestoFlow API service is operational.');
    }
}

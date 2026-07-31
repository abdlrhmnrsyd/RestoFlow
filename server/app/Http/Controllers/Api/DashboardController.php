<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class DashboardController
 * @package App\Http\Controllers\Api
 * 
 * Controller for Dashboard Analytics & Business Metrics.
 */
class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function stats(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo(PermissionEnum::DASHBOARD_VIEW->value)) {
            return $this->forbiddenResponse('You do not have access to view dashboard statistics.');
        }

        $stats = $this->dashboardService->getStats();

        return $this->successResponse($stats, 'Dashboard statistics retrieved successfully.');
    }

    public function popularMenus(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo(PermissionEnum::DASHBOARD_VIEW->value)) {
            return $this->forbiddenResponse();
        }

        $popular = $this->dashboardService->getPopularMenus();

        return $this->successResponse($popular, 'Popular menus retrieved successfully.');
    }

    public function salesChart(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermissionTo(PermissionEnum::DASHBOARD_VIEW->value)) {
            return $this->forbiddenResponse();
        }

        $days = (int) $request->query('days', 7);
        $chart = $this->dashboardService->getSalesChart($days);

        return $this->successResponse($chart, 'Sales chart data retrieved successfully.');
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MidtransService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class MidtransController
 * @package App\Http\Controllers\Api
 * 
 * Endpoints for generating Midtrans Snap Tokens and processing Notification Webhooks.
 */
class MidtransController extends Controller
{
    public function __construct(
        protected MidtransService $midtransService
    ) {}

    /**
     * Request Midtrans Snap Token for an Order.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSnapToken(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
        ]);

        $order = Order::findOrFail($request->input('order_id'));

        try {
            $result = $this->midtransService->createSnapToken($order);
            return $this->successResponse($result, 'Midtrans Snap Token generated successfully.');
        } catch (Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Handle incoming Midtrans Webhook Notification callback.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handleNotification(Request $request): JsonResponse
    {
        $payload = $request->all();
        $processed = $this->midtransService->handleNotification($payload);

        if ($processed) {
            return response()->json(['status' => 'success', 'message' => 'Notification handled']);
        }

        return response()->json(['status' => 'ignored', 'message' => 'Notification processed or ignored']);
    }
}

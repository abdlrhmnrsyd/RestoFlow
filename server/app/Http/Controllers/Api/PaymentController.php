<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class PaymentController
 * @package App\Http\Controllers\Api
 * 
 * RESTful API Controller for Payment Transactions.
 */
class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $perPage = (int) $request->query('per_page', 15);
        $search = $request->query('search');
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = $request->query('sort_order', 'desc');

        $filters = [];
        if ($request->has('payment_method')) {
            $filters['payment_method'] = $request->query('payment_method');
        }
        if ($request->has('status')) {
            $filters['status'] = $request->query('status');
        }

        $payments = $this->paymentService->getPaginated(
            perPage: $perPage,
            search: $search,
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );

        return $this->successResponse(
            PaymentResource::collection($payments)->response()->getData(true),
            'Payments retrieved successfully.'
        );
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $this->authorize('create', Payment::class);

        $payment = $this->paymentService->processPayment($request->validated());

        return $this->successResponse(
            new PaymentResource($payment),
            'Payment processed successfully.',
            201
        );
    }

    public function show(int|string $id): JsonResponse
    {
        $payment = $this->paymentService->getPaymentById($id);
        $this->authorize('view', $payment);

        return $this->successResponse(
            new PaymentResource($payment),
            'Payment detail retrieved successfully.'
        );
    }
}

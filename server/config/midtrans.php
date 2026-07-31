<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options for Midtrans Snap API and Notification Webhooks.
    |
    */

    'server_key' => env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-DemoKeyRestoFlow123'),

    'client_key' => env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-DemoKeyRestoFlow123'),

    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),

    'is_3ds' => env('MIDTRANS_IS_3DS', true),
];

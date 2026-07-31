<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class TestController extends Controller
{
    public function index()
    {
        return $this->success([
            'name' => 'RestoFlow',
            'version' => '1.0.0',
        ], 'API Working');
    }
}
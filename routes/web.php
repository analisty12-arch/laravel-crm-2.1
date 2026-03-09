<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| React SPA is the primary entry point served at root.
| Krayin admin panel remains at /admin for backoffice use only.
|
*/

// React SPA — catch-all at root (handles all frontend routing)
Route::get('/{any?}', function () {
    return view('checklist.app');
})->where('any', '^(?!admin|api|sanctum).*$');

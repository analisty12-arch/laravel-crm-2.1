<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChecklistController;
use App\Http\Controllers\Api\TaskController;

// Public routes (no auth required)
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Checklists CRUD
    Route::get('/checklists', [ChecklistController::class, 'index']);
    Route::post('/checklists', [ChecklistController::class, 'store']);
    Route::get('/checklists/{id}', [ChecklistController::class, 'show']);
    Route::put('/checklists/{id}', [ChecklistController::class, 'update']);
    Route::delete('/checklists/{id}', [ChecklistController::class, 'destroy']);

    // Tasks CRUD
    Route::post('/checklists/{checklistId}/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);

    // Filas e Chat
    Route::get('/chat/queues', [\App\Http\Controllers\Api\ChatQueueController::class, 'index']);
    Route::post('/chat/queues', [\App\Http\Controllers\Api\ChatQueueController::class, 'store']); // Apenas gestor
    Route::post('/chat/queues/{id}/online', [\App\Http\Controllers\Api\ChatQueueController::class, 'goOnline']);
    Route::post('/chat/queues/{id}/offline', [\App\Http\Controllers\Api\ChatQueueController::class, 'goOffline']);

    Route::get('/chat/sessions/active', [\App\Http\Controllers\Api\ChatQueueController::class, 'activeSessions']);
    Route::post('/chat/sessions/{id}/finish', [\App\Http\Controllers\Api\ChatQueueController::class, 'finishSession']);
});

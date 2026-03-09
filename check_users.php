<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Webkul\User\Models\User;

$users = User::with('role')->take(5)->get();

if ($users->isEmpty()) {
    echo "Nenhum usuário encontrado.\n";
} else {
    foreach ($users as $user) {
        echo "---\n";
        echo "ID: " . $user->id . "\n";
        echo "Name: " . $user->name . "\n";
        echo "Email: " . $user->email . "\n";
        echo "Status: " . $user->status . "\n";
        echo "Role: " . ($user->role ? $user->role->name : 'null') . "\n";
    }
}

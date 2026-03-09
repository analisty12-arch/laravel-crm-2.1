<?php
$res = \Illuminate\Support\Facades\Auth::guard('user')->attempt(['email' => 'admin@example.com', 'password' => 'admin123']);
echo "Auth user attempt: " . ($res ? "SUCCESS" : "FAIL") . "\n";

$res2 = \Illuminate\Support\Facades\Auth::guard('user')->attempt(['email' => 'admin@example.com', 'password' => 'admin123', 'status' => 1]);
echo "Auth user with status=1 attempt: " . ($res2 ? "SUCCESS" : "FAIL") . "\n";

<?php
$log = file_get_contents('storage/logs/laravel.log');
$lines = explode("\n", $log);
for ($i = count($lines) - 1; $i >= 0; $i--) {
    if (strpos($lines[$i], 'local.ERROR') !== false) {
        if (strpos($lines[$i], 'Login failed') === false) {
            echo "EXCEPTION: " . $lines[$i] . "\n";
            break;
        }
    }
}

<?php
$log = file_get_contents('storage/logs/laravel.log');
$lines = explode("\n", $log);
for ($i = count($lines) - 1; $i >= 0; $i--) {
    if (strpos($lines[$i], 'local.ERROR') !== false) {
        $errorBlock = array_slice($lines, $i, 10);
        echo implode("\n", $errorBlock);
        break;
    }
}

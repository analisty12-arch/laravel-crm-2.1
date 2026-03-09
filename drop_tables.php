<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

DB::statement('SET FOREIGN_KEY_CHECKS=0;');
Schema::dropIfExists('agent_presences');
Schema::dropIfExists('chat_sessions');
Schema::dropIfExists('chat_queue_agents');
Schema::dropIfExists('chat_queues');
DB::statement('SET FOREIGN_KEY_CHECKS=1;');

echo "Tabelas apagadas.\n";

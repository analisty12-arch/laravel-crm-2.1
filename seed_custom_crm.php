<?php
require 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // 1. Check if we have an admin user in Laravel to assign the lead
    $user = DB::table('users')->first();

    // 2. Insert Test Lead
    $leadId = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'; // Example UUID
    DB::table('crm_leads')->insertOrIgnore([
        'id' => $leadId,
        'name' => 'Dr. Pedro Alvarenga',
        'email' => 'contato@pedroalvarenga.com.br',
        'phone' => '11999999999',
        'segment' => 'medico',
        'specialty' => 'Dermatologista',
        'status' => 'convertido',
        'ai_score_hot' => true,
        'ai_analysis_summary' => 'Lead extremamente interessado nos fios de PDO espiculados.',
        'created_at' => now(),
        'updated_at' => now()
    ]);

    // 3. Insert Test Order
    DB::table('crm_orders')->insertOrIgnore([
        'id' => 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
        'lead_id' => $leadId,
        'payment_status' => 'paid',
        'total_amount_cents' => 150000, // R$ 1.500,00
        'created_at' => now()
    ]);

    echo "Seed data for custom CRM tables inserted successfully!\n";
} catch (\Exception $e) {
    echo "Error seeding: " . $e->getMessage() . "\n";
}

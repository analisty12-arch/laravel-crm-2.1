<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Filas de atendimento (por região)
        Schema::create('chat_queues', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');                         // "Sudeste", "Norte", "Sul"
            $table->string('region')->nullable();           // "SP", "RJ", "MG"
            $table->string('color', 7)->default('#6366f1'); // hex para UI
            $table->text('description')->nullable();
            $table->integer('max_concurrent')->default(3);  // max chats por agente
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Atendentes atribuídos a filas (pelo gestor)
        Schema::create('chat_queue_agents', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('queue_id');
            $table->unsignedInteger('user_id');
            $table->foreign('queue_id')->references('id')->on('chat_queues')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['queue_id', 'user_id']);
            $table->timestamps();
        });

        // Sessões de atendimento (chats ativos / histórico)
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('queue_id');
            $table->unsignedInteger('agent_id')->nullable();
            $table->foreign('queue_id')->references('id')->on('chat_queues')->onDelete('cascade');
            $table->foreign('agent_id')->references('id')->on('users')->onDelete('set null');

            // Dados do cliente/contato
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->string('contact_segment')->nullable(); // "Estética", "Cirurgia"...

            // Status do atendimento
            $table->enum('status', ['waiting', 'in_progress', 'finished'])->default('waiting');

            // Mensagens salvas como JSON
            $table->json('messages')->nullable();

            $table->timestamp('started_at')->nullable();   // quando agente assumiu
            $table->timestamp('finished_at')->nullable();  // quando encerrou
            $table->timestamps();
        });

        // Presença online dos agentes em cada fila
        Schema::create('agent_presences', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('queue_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('queue_id')->references('id')->on('chat_queues')->onDelete('cascade');
            $table->boolean('is_online')->default(false);
            $table->timestamp('last_activity')->nullable();
            $table->unique(['user_id', 'queue_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_presences');
        Schema::dropIfExists('chat_sessions');
        Schema::dropIfExists('chat_queue_agents');
        Schema::dropIfExists('chat_queues');
    }
};

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class ChatQueueController extends Controller
{
    // Listar todas as filas (gestor ou agente)
    public function index()
    {
        $queues = DB::table('chat_queues')->get();
        // Anexar atendentes a cada fila
        foreach ($queues as $queue) {
            $queue->agents = DB::table('chat_queue_agents')
                ->join('users', 'users.id', '=', 'chat_queue_agents.user_id')
                ->where('chat_queue_agents.queue_id', $queue->id)
                ->select('users.id', 'users.name')
                ->get();
        }
        return response()->json($queues);
    }

    // Criar uma fila (Gestor)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'region' => 'nullable|string',
            'color' => 'nullable|string',
            'description' => 'nullable|string',
            'max_concurrent' => 'integer|min:1|max:10',
            'agents' => 'array'
        ]);

        try {
            DB::beginTransaction();
            $id = DB::table('chat_queues')->insertGetId([
                'name' => $data['name'],
                'region' => $data['region'] ?? null,
                'color' => $data['color'] ?? '#6366f1',
                'description' => $data['description'] ?? null,
                'max_concurrent' => $data['max_concurrent'] ?? 3,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (!empty($data['agents'])) {
                $agentsData = collect($data['agents'])->map(fn($uId) => [
                    'queue_id' => $id,
                    'user_id' => $uId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->toArray();
                DB::table('chat_queue_agents')->insert($agentsData);
            }
            DB::commit();

            return response()->json(['message' => 'Fila criada com sucesso!', 'id' => $id]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    // Listar as sessões ativas do agente atual
    public function activeSessions(Request $request)
    {
        $userId = $request->user()->id;
        $sessions = DB::table('chat_sessions')
            ->where('agent_id', $userId)
            ->where('status', 'in_progress')
            ->get();

        foreach ($sessions as $session) {
            $session->messages = json_decode($session->messages);
        }

        return response()->json($sessions);
    }

    // Entrar na fila para receber chats
    public function goOnline(Request $request, $queueId)
    {
        DB::table('agent_presences')->updateOrInsert(
            ['user_id' => $request->user()->id, 'queue_id' => $queueId],
            ['is_online' => true, 'last_activity' => now(), 'updated_at' => now()]
        );

        return response()->json(['message' => 'Você está online na fila e pronto para receber chats!']);
    }

    // Sair da fila
    public function goOffline(Request $request, $queueId)
    {
        DB::table('agent_presences')->updateOrInsert(
            ['user_id' => $request->user()->id, 'queue_id' => $queueId],
            ['is_online' => false, 'updated_at' => now()]
        );

        return response()->json(['message' => 'Você saiu da fila.']);
    }

    // Encerrar um chat
    public function finishSession(Request $request, $sessionId)
    {
        DB::table('chat_sessions')
            ->where('id', $sessionId)
            ->where('agent_id', $request->user()->id)
            ->update([
                'status' => 'finished',
                'finished_at' => now()
            ]);

        return response()->json(['message' => 'Atendimento encerrado com sucesso.']);
    }
}

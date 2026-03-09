<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Checklist;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request, string $checklistId)
    {
        $checklist = Checklist::where('user_id', $request->user()->id)->findOrFail($checklistId);

        $request->validate([
            'text' => 'required|string',
            'role' => 'nullable|string',
            'completed' => 'boolean',
        ]);

        $task = $checklist->tasks()->create([
            'text' => $request->text,
            'role' => $request->role,
            'completed' => $request->completed ?? false,
        ]);

        return response()->json($task, 201);
    }

    public function update(Request $request, string $id)
    {
        $task = Task::findOrFail($id);

        // Ensure user owns checklist
        Checklist::where('user_id', $request->user()->id)->findOrFail($task->checklist_id);

        $task->update($request->only(['text', 'role', 'completed']));

        return response()->json($task);
    }

    public function destroy(Request $request, string $id)
    {
        $task = Task::findOrFail($id);

        Checklist::where('user_id', $request->user()->id)->findOrFail($task->checklist_id);

        $task->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

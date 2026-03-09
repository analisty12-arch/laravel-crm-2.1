<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Checklist;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    public function index(Request $request)
    {
        $checklists = Checklist::where('user_id', $request->user()->id)
            ->with('tasks')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($checklists);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'nullable|string',
            'data' => 'nullable|array',
        ]);

        $checklist = Checklist::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'type' => $request->type,
            'data' => $request->data,
        ]);

        return response()->json($checklist->load('tasks'), 201);
    }

    public function show(Request $request, string $id)
    {
        $checklist = Checklist::where('user_id', $request->user()->id)
            ->with('tasks')
            ->findOrFail($id);

        return response()->json($checklist);
    }

    public function update(Request $request, string $id)
    {
        $checklist = Checklist::where('user_id', $request->user()->id)->findOrFail($id);

        $checklist->update($request->only(['title', 'type', 'data']));

        return response()->json($checklist);
    }

    public function destroy(Request $request, string $id)
    {
        $checklist = Checklist::where('user_id', $request->user()->id)->findOrFail($id);
        $checklist->delete();

        return response()->json(['message' => 'Deleted']);
    }
}

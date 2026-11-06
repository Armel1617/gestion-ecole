<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NoteIndexRequest;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\JsonResponse;

class NoteController extends Controller
{
    public function index(NoteIndexRequest $request)
    {
        $query = Note::with(['inscription.etudiant', 'inscription.formation'])
            ->latest('date_evaluation');

        if ($request->filled('inscription_id')) {
            $query->where('inscription_id', $request->integer('inscription_id'));
        }
        if ($request->filled('matiere')) {
            $query->where('matiere', 'like', '%'.$request->string('matiere')->toString().'%');
        }

        return NoteResource::collection($query->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreNoteRequest $request): JsonResponse
    {
        $note = Note::create($request->validated());

        return (new NoteResource($note->load('inscription.etudiant', 'inscription.formation')))
            ->response()->setStatusCode(201);
    }

    public function show(Note $note): NoteResource
    {
        return new NoteResource($note->load('inscription.etudiant', 'inscription.formation'));
    }

    public function update(UpdateNoteRequest $request, Note $note): NoteResource
    {
        $note->update($request->validated());

        return new NoteResource($note->refresh()->load('inscription.etudiant', 'inscription.formation'));
    }

    public function destroy(Note $note): JsonResponse
    {
        $note->delete();

        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PresenceIndexRequest;
use App\Http\Requests\StorePresenceRequest;
use App\Http\Requests\UpdatePresenceRequest;
use App\Http\Resources\PresenceResource;
use App\Models\Presence;
use Illuminate\Http\JsonResponse;

class PresenceController extends Controller
{
    public function index(PresenceIndexRequest $request)
    {
        $query = Presence::with(['inscription.etudiant', 'inscription.formation'])
            ->latest('date_presence');

        if ($request->filled('inscription_id')) {
            $query->where('inscription_id', $request->integer('inscription_id'));
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->string('statut')->toString());
        }
        if ($request->filled('date_debut')) {
            $query->whereDate('date_presence', '>=', $request->date('date_debut'));
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('date_presence', '<=', $request->date('date_fin'));
        }

        return PresenceResource::collection($query->paginate($request->integer('per_page', 15)));
    }

    public function store(StorePresenceRequest $request): JsonResponse
    {
        $presence = Presence::create([
            ...$request->validated(),
            'minutes_retard' => $request->validated('minutes_retard') ?? 0,
        ]);

        return (new PresenceResource($presence->load('inscription.etudiant', 'inscription.formation')))
            ->response()->setStatusCode(201);
    }

    public function show(Presence $presence): PresenceResource
    {
        return new PresenceResource($presence->load('inscription.etudiant', 'inscription.formation'));
    }

    public function update(UpdatePresenceRequest $request, Presence $presence): PresenceResource
    {
        $presence->update($request->validated());

        return new PresenceResource($presence->refresh()->load('inscription.etudiant', 'inscription.formation'));
    }

    public function destroy(Presence $presence): JsonResponse
    {
        $presence->delete();

        return response()->json(null, 204);
    }
}

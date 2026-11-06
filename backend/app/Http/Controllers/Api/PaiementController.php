<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleUtilisateur;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaiementIndexRequest;
use App\Http\Requests\StorePaiementRequest;
use App\Http\Requests\UpdatePaiementRequest;
use App\Http\Resources\PaiementResource;
use App\Models\Paiement;
use App\Models\User;
use App\Notifications\PaiementEnregistreNotification;
use Illuminate\Http\JsonResponse;

class PaiementController extends Controller
{
    public function index(PaiementIndexRequest $request)
    {
        $query = Paiement::with(['inscription.etudiant', 'inscription.formation'])->latest('date_paiement');

        if ($request->filled('inscription_id')) {
            $query->where('inscription_id', $request->integer('inscription_id'));
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->string('statut')->toString());
        }

        return PaiementResource::collection($query->paginate($request->integer('per_page', 15)));
    }

    public function store(StorePaiementRequest $request): JsonResponse
    {
        $paiement = Paiement::create([
            ...$request->validated(),
            'date_paiement' => $request->validated('date_paiement') ?? now()->toDateString(),
            'statut' => $request->validated('statut') ?? 'paye',
        ]);
        User::query()
            ->whereIn('role', [RoleUtilisateur::ADMINISTRATEUR->value, RoleUtilisateur::DIRECTION->value])
            ->each(fn (User $user) => $user->notify(new PaiementEnregistreNotification($paiement)));

        return (new PaiementResource($paiement->load('inscription.etudiant', 'inscription.formation')))->response()->setStatusCode(201);
    }

    public function show(Paiement $paiement): PaiementResource
    {
        return new PaiementResource($paiement->load('inscription.etudiant', 'inscription.formation'));
    }

    public function update(UpdatePaiementRequest $request, Paiement $paiement): PaiementResource
    {
        $paiement->update($request->validated());

        return new PaiementResource($paiement->refresh()->load('inscription'));
    }

    public function destroy(Paiement $paiement): JsonResponse
    {
        $paiement->delete();

        return response()->json(null, 204);
    }
}

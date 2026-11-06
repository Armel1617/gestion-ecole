<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FormationIndexRequest;
use App\Http\Requests\StoreFormationRequest;
use App\Http\Requests\UpdateFormationRequest;
use App\Http\Resources\FormationResource;
use App\Models\Formation;
use Illuminate\Support\Facades\Cache;

class FormationController extends Controller
{
    // LIRE : liste des formations, avec recherche possible (/api/formations?search=info)
    public function index(FormationIndexRequest $request)
    {
        // withCount ajoute le nombre d'inscrits dans une colonne "inscriptions_count"
        // (on s'en servira pour le tableau de bord)
        $query = Formation::withCount('inscriptions');

        // Recherche par intitulé
        if ($request->filled('search')) {
            $query->where('intitule', 'like', '%'.$request->string('search')->toString().'%');
        }

        $query->orderBy('intitule');

        return $request->routeIs('api.v1.*')
            ? FormationResource::collection($query->paginate($request->integer('per_page', 15)))
            : response()->json($query->get());
    }

    // CRÉER : ajoute une formation
    public function store(StoreFormationRequest $request)
    {
        $formation = Formation::create($request->validated());
        Cache::forget('dashboard:summary');

        return $request->routeIs('api.v1.*')
            ? (new FormationResource($formation))->response()->setStatusCode(201)
            : response()->json($formation, 201);
    }

    // LIRE UNE SEULE : renvoie une formation
    public function show(Formation $formation)
    {
        return request()->routeIs('api.v1.*')
            ? new FormationResource($formation)
            : response()->json($formation);
    }

    // MODIFIER : met à jour une formation
    public function update(UpdateFormationRequest $request, Formation $formation)
    {
        $formation->update($request->validated());
        Cache::forget('dashboard:summary');

        return $request->routeIs('api.v1.*')
            ? new FormationResource($formation)
            : response()->json($formation);
    }

    // SUPPRIMER : efface la formation (et ses inscriptions, grâce à cascadeOnDelete)
    public function destroy(Formation $formation)
    {
        abort_unless(request()->user()->hasAnyRole('administrateur', 'direction'), 403, 'Seuls l’administration et la direction peuvent supprimer une formation.');

        $formation->delete();
        Cache::forget('dashboard:summary');

        return response()->noContent(); // 204 = réussi, rien à renvoyer
    }
}

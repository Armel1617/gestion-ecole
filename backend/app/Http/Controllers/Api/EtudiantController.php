<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EtudiantIndexRequest;
use App\Http\Requests\StoreEtudiantRequest;
use App\Http\Requests\UpdateEtudiantRequest;
use App\Http\Resources\EtudiantResource;
use App\Models\Etudiant;
use Illuminate\Support\Facades\Cache;

class EtudiantController extends Controller
{
    // LIRE : renvoie la liste des étudiants (avec recherche et filtre possibles)
    // Exemples : /api/etudiants?search=awa   ou   /api/etudiants?formation_id=2
    public function index(EtudiantIndexRequest $request)
    {
        $query = Etudiant::query(); // on prépare la requête sur la table etudiants

        // Si React envoie un mot de recherche, on cherche dans nom, prénom et email
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Si React envoie une formation, on garde seulement les étudiants inscrits à celle-ci
        if ($request->filled('formation_id')) {
            $query->whereHas('inscriptions', function ($q) use ($request) {
                $q->where('formation_id', $request->formation_id);
            });
        }

        // On trie par nom et on renvoie le résultat en JSON (le format lu par React)
        $query->orderBy('nom')->orderBy('prenom');

        if ($request->routeIs('api.v1.*')) {
            return EtudiantResource::collection($query->paginate($request->integer('per_page', 15)));
        }

        return response()->json($query->get());
    }

    // CRÉER : enregistre un nouvel étudiant
    public function store(StoreEtudiantRequest $request)
    {
        // Validation : Laravel refuse la demande si une règle n'est pas respectée
        $etudiant = Etudiant::create($request->validated());
        Cache::forget('dashboard:summary');

        // 201 = "créé avec succès"
        return $request->routeIs('api.v1.*')
            ? (new EtudiantResource($etudiant))->response()->setStatusCode(201)
            : response()->json($etudiant, 201);
    }

    // LIRE UN SEUL : renvoie un étudiant avec ses formations
    public function show(Etudiant $etudiant)
    {
        $etudiant->load('formations');

        return $this->isV1($etudiant)
            ? new EtudiantResource($etudiant)
            : response()->json($etudiant);
    }

    // MODIFIER : met à jour un étudiant existant
    public function update(UpdateEtudiantRequest $request, Etudiant $etudiant)
    {
        $etudiant->update($request->validated());
        Cache::forget('dashboard:summary');

        return $request->routeIs('api.v1.*')
            ? new EtudiantResource($etudiant)
            : response()->json($etudiant);
    }

    // SUPPRIMER : efface un étudiant (ses inscriptions disparaissent aussi grâce à cascadeOnDelete)
    public function destroy(Etudiant $etudiant)
    {
        abort_unless(request()->user()->hasAnyRole('administrateur', 'direction'), 403, 'Seuls l’administration et la direction peuvent supprimer un étudiant.');

        $etudiant->delete();
        Cache::forget('dashboard:summary');

        // 204 = "réussi, rien à renvoyer"
        return response()->noContent();
    }

    private function isV1(Etudiant $etudiant): bool
    {
        return request()->routeIs('api.v1.*');
    }
}

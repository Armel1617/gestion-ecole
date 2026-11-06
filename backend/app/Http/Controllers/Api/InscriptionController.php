<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InscriptionIndexRequest;
use App\Http\Requests\StoreInscriptionRequest;
use App\Http\Requests\UpdateInscriptionRequest;
use App\Http\Resources\InscriptionResource;
use App\Models\AnneeAcademique;
use App\Models\Inscription;
use Illuminate\Support\Facades\Cache;

class InscriptionController extends Controller
{
    // LIRE : liste des inscriptions, avec filtres possibles
    // Exemples : /api/inscriptions?formation_id=1   ou   /api/inscriptions?statut=en_cours
    public function index(InscriptionIndexRequest $request)
    {
        // with(...) charge en même temps l'étudiant et la formation de chaque inscription,
        // pour que React puisse afficher leurs noms et pas seulement leurs numéros
        $query = Inscription::with(['etudiant', 'formation']);
        if ($request->routeIs('api.v1.*')) {
            $query->with('anneeAcademique');
        }

        // Filtre par formation
        if ($request->filled('formation_id')) {
            $query->where('formation_id', $request->integer('formation_id'));
        }

        // Filtre par étudiant
        if ($request->filled('etudiant_id')) {
            $query->where('etudiant_id', $request->integer('etudiant_id'));
        }

        // Filtre par statut (en_cours, terminee, annulee)
        if ($request->filled('statut')) {
            $query->where('statut', $request->string('statut')->toString());
        }

        // Les plus récentes d'abord
        $query->latest('date_inscription');

        return $request->routeIs('api.v1.*')
            ? InscriptionResource::collection($query->paginate($request->integer('per_page', 15)))
            : response()->json($query->get());
    }

    // CRÉER : inscrit un étudiant à une formation
    public function store(StoreInscriptionRequest $request)
    {
        $donnees = $request->validated();

        // Si React n'envoie pas de date, on met la date d'aujourd'hui
        $donnees['date_inscription'] = $donnees['date_inscription'] ?? now()->toDateString();

        if ($request->routeIs('api.v1.*')) {
            $donnees['annee_academique_id'] ??= AnneeAcademique::where('active', true)->value('id');
        }
        $inscription = Inscription::create($donnees);
        Cache::forget('dashboard:summary');

        // On renvoie l'inscription avec les noms de l'étudiant et de la formation
        return $request->routeIs('api.v1.*')
            ? (new InscriptionResource($inscription->load(['etudiant', 'formation', 'anneeAcademique'])))->response()->setStatusCode(201)
            : response()->json($inscription->load(['etudiant', 'formation']), 201);
    }

    // MODIFIER : on ne change que le statut (ex : passer de en_cours à terminee)
    public function update(UpdateInscriptionRequest $request, Inscription $inscription)
    {
        $inscription->update($request->validated());
        Cache::forget('dashboard:summary');

        return $request->routeIs('api.v1.*')
            ? new InscriptionResource($inscription->load(['etudiant', 'formation', 'anneeAcademique']))
            : response()->json($inscription->load(['etudiant', 'formation', 'anneeAcademique']));
    }

    // SUPPRIMER : annule (efface) une inscription
    public function destroy(Inscription $inscription)
    {
        abort_unless(request()->user()->hasAnyRole('administrateur', 'direction'), 403, 'Seuls l’administration et la direction peuvent supprimer une inscription.');

        $inscription->delete();
        Cache::forget('dashboard:summary');

        return response()->noContent();
    }
}

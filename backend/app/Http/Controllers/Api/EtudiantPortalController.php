<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Http\Resources\InscriptionResource;
use App\Http\Resources\PaiementResource;
use App\Http\Resources\NoteResource;
use App\Http\Resources\PresenceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EtudiantPortalController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json($request->user()->etudiant()->with('formations')->firstOrFail());
    }

    public function inscriptions(Request $request)
    {
        return InscriptionResource::collection(
            $request->user()->etudiant()->firstOrFail()->inscriptions()
                ->with(['formation', 'anneeAcademique'])
                ->latest('date_inscription')
                ->paginate($request->integer('per_page', 15))
        );
    }

    public function paiements(Request $request)
    {
        return PaiementResource::collection(
            $request->user()->etudiant()->firstOrFail()->inscriptions()
                ->with('paiements')
                ->get()
                ->flatMap->paiements
                ->values()
        );
    }

    public function notes(Request $request)
    {
        return NoteResource::collection(
            $request->user()->etudiant()->firstOrFail()->inscriptions()
                ->with('notes')
                ->get()
                ->flatMap->notes
                ->values()
        );
    }

    public function presences(Request $request)
    {
        return PresenceResource::collection(
            $request->user()->etudiant()->firstOrFail()->inscriptions()
                ->with('presences')
                ->get()
                ->flatMap->presences
                ->values()
        );
    }

    public function documents(Request $request)
    {
        return DocumentResource::collection(
            $request->user()->etudiant()->firstOrFail()->documents()->latest()->paginate($request->integer('per_page', 15))
        );
    }
}

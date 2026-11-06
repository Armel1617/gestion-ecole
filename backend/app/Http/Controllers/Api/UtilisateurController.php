<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUtilisateurRequest;
use App\Http\Requests\UpdateUtilisateurRequest;
use App\Http\Resources\UtilisateurResource;
use App\Models\User;
use App\Models\Etudiant;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class UtilisateurController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::query()
            ->select(['id', 'name', 'email', 'role', 'created_at'])
            ->latest()
            ->get());
    }

    public function show(User $utilisateur): JsonResponse
    {
        return response()->json($utilisateur->only(['id', 'name', 'email', 'role', 'created_at']));
    }

    public function store(StoreUtilisateurRequest $request): JsonResponse
    {
        $utilisateur = DB::transaction(function () use ($request): User {
            $data = $request->validated();
            $utilisateur = User::create($data);

            if ($utilisateur->role->value === 'etudiant') {
                Etudiant::create([
                    'user_id' => $utilisateur->id,
                    'nom' => $data['nom'],
                    'prenom' => $data['prenom'],
                    'email' => $data['email'],
                ]);
            }

            return $utilisateur;
        });

        return (new UtilisateurResource($utilisateur))->response()->setStatusCode(201);
    }

    public function update(UpdateUtilisateurRequest $request, User $utilisateur): JsonResponse
    {
        $data = $request->validated();
        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $utilisateur->update($data);

        return response()->json($utilisateur->fresh()->only(['id', 'name', 'email', 'role', 'created_at']));
    }
}

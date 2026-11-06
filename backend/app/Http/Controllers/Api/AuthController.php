<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Etudiant;
use App\Enums\RoleUtilisateur;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // CRÉER UN COMPTE : enregistre un utilisateur et le connecte tout de suite
    public function creerCompte(Request $request)
    {
        $donnees = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email', // un seul compte par email
            'password' => 'required|string|min:8|confirmed',           // "confirmed" : doit être répété
        ], [
            // Messages en français (sinon Laravel les affiche en anglais)
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => "L'email est obligatoire.",
            'email.email' => "Cet email n'est pas valide.",
            'email.unique' => 'Un compte existe déjà avec cet email.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'Les deux mots de passe ne sont pas identiques.',
        ]);

        $utilisateur = DB::transaction(function () use ($donnees): User {
            $utilisateur = User::create([
                'name' => $donnees['prenom'].' '.$donnees['nom'],
                'email' => $donnees['email'],
                'password' => $donnees['password'],
                'role' => RoleUtilisateur::ETUDIANT,
            ]);

            Etudiant::create([
                'user_id' => $utilisateur->id,
                'nom' => $donnees['nom'],
                'prenom' => $donnees['prenom'],
                'email' => $donnees['email'],
            ]);

            return $utilisateur;
        });

        // Le jeton : le "badge" que React renverra à chaque demande
        $jeton = $utilisateur->createToken('navigateur')->plainTextToken;

        return response()->json(['user' => $utilisateur, 'token' => $jeton], 201);
    }

    // SE CONNECTER : vérifie l'email et le mot de passe, puis donne un jeton
    public function connexion(Request $request)
    {
        $donnees = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => "L'email est obligatoire.",
            'email.email' => "Cet email n'est pas valide.",
            'password.required' => 'Le mot de passe est obligatoire.',
        ]);

        $utilisateur = User::where('email', $donnees['email'])->first();

        // Hash::check compare le mot de passe tapé avec la version chiffrée de la base
        if (! $utilisateur || ! Hash::check($donnees['password'], $utilisateur->password)) {
            // Même message dans les deux cas : on ne dit pas si c'est l'email ou le mot de passe qui est faux
            throw ValidationException::withMessages(['email' => 'Email ou mot de passe incorrect.']);
        }

        $jeton = $utilisateur->createToken('navigateur')->plainTextToken;

        return response()->json(['user' => $utilisateur, 'token' => $jeton]);
    }

    // SE DÉCONNECTER : supprime le jeton utilisé pour cette demande
    public function deconnexion(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté']);
    }

    // QUI SUIS-JE ? : renvoie l'utilisateur connecté (React s'en sert au rechargement de la page)
    public function moi(Request $request)
    {
        return response()->json($request->user());
    }

    public function changerMotDePasse(Request $request)
    {
        $donnees = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update(['password' => $donnees['password']]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }
}

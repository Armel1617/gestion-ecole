<?php

use App\Http\Controllers\Api\AnneeAcademiqueController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BulletinController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\FormationController;
use App\Http\Controllers\Api\InscriptionController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OperationsController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\PresenceController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\EtudiantPortalController;
use Illuminate\Support\Facades\Route;

// throttle:5,1 = 5 tentatives de connexion par minute (empêche de deviner un mot de passe)
Route::post('creer-compte', [AuthController::class, 'creerCompte'])->middleware('throttle:10,1');
Route::post('connexion', [AuthController::class, 'connexion'])->middleware('throttle:5,1');
Route::get('health', [OperationsController::class, 'health']);
Route::get('openapi.json', [OperationsController::class, 'openApi']);
Route::put('mot-de-passe', [AuthController::class, 'changerMotDePasse'])
    ->middleware(['auth:sanctum', 'audit.api']);

// ---------- Routes PROTÉGÉES : il faut envoyer un jeton valide ----------
Route::middleware(['auth:sanctum', 'audit.api', 'role:administrateur,direction,secretaire,enseignant'])->group(function () {
    Route::post('deconnexion', [AuthController::class, 'deconnexion']);
    Route::get('me', [AuthController::class, 'moi']);

    Route::apiResource('etudiants', EtudiantController::class);
    Route::apiResource('formations', FormationController::class);
    Route::apiResource('inscriptions', InscriptionController::class)->except(['show']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::apiResource('annees-academiques', AnneeAcademiqueController::class)
        ->parameters(['annees-academiques' => 'anneeAcademique']);
    Route::middleware('role:administrateur,direction,secretaire')->group(function () {
        Route::apiResource('paiements', PaiementController::class);
    });
    Route::apiResource('presences', PresenceController::class);
    Route::apiResource('notes', NoteController::class);
    Route::get('inscriptions/{inscription}/bulletin', [BulletinController::class, 'show']);
    Route::get('documents/{document}/download', [DocumentController::class, 'download']);
    Route::apiResource('documents', DocumentController::class)->only(['index', 'store', 'destroy']);
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{notification}/lire', [NotificationController::class, 'read']);
    Route::post('notifications/lire-tout', [NotificationController::class, 'readAll']);
    Route::middleware('role:administrateur,direction')->group(function () {
        Route::get('utilisateurs', [UtilisateurController::class, 'index']);
        Route::post('utilisateurs', [UtilisateurController::class, 'store']);
    });
    Route::middleware('role:administrateur')->group(function () {
        Route::get('utilisateurs/{utilisateur}', [UtilisateurController::class, 'show']);
        Route::put('utilisateurs/{utilisateur}', [UtilisateurController::class, 'update']);
    });
});

Route::middleware(['auth:sanctum', 'audit.api', 'role:etudiant'])->group(function () {
    Route::get('etudiant/profil', [EtudiantPortalController::class, 'profile']);
    Route::get('etudiant/inscriptions', [EtudiantPortalController::class, 'inscriptions']);
    Route::get('etudiant/paiements', [EtudiantPortalController::class, 'paiements']);
    Route::get('etudiant/notes', [EtudiantPortalController::class, 'notes']);
    Route::get('etudiant/presences', [EtudiantPortalController::class, 'presences']);
    Route::get('etudiant/documents', [EtudiantPortalController::class, 'documents']);
});

Route::prefix('v1/etudiant')->name('api.v1.etudiant.')->middleware(['auth:sanctum', 'audit.api', 'role:etudiant'])->group(function () {
    Route::get('profil', [EtudiantPortalController::class, 'profile']);
    Route::get('inscriptions', [EtudiantPortalController::class, 'inscriptions']);
    Route::get('paiements', [EtudiantPortalController::class, 'paiements']);
    Route::get('notes', [EtudiantPortalController::class, 'notes']);
    Route::get('presences', [EtudiantPortalController::class, 'presences']);
    Route::get('documents', [EtudiantPortalController::class, 'documents']);
});

Route::prefix('v1')->name('api.v1.')->middleware(['auth:sanctum', 'audit.api', 'role:administrateur,direction,secretaire,enseignant'])->group(function () {
    Route::post('deconnexion', [AuthController::class, 'deconnexion']);
    Route::get('me', [AuthController::class, 'moi']);
    Route::apiResource('etudiants', EtudiantController::class);
    Route::apiResource('formations', FormationController::class);
    Route::apiResource('inscriptions', InscriptionController::class)->except(['show']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::apiResource('annees-academiques', AnneeAcademiqueController::class)
        ->parameters(['annees-academiques' => 'anneeAcademique']);
    Route::middleware('role:administrateur,direction,secretaire')->group(function () {
        Route::apiResource('paiements', PaiementController::class);
    });

    Route::apiResource('presences', PresenceController::class);
    Route::apiResource('notes', NoteController::class);
    Route::get('inscriptions/{inscription}/bulletin', [BulletinController::class, 'show']);
    Route::get('documents/{document}/download', [DocumentController::class, 'download']);
    Route::apiResource('documents', DocumentController::class)->only(['index', 'store', 'destroy']);
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{notification}/lire', [NotificationController::class, 'read']);
    Route::post('notifications/lire-tout', [NotificationController::class, 'readAll']);
    Route::middleware('role:administrateur,direction')->group(function () {
        Route::get('utilisateurs', [UtilisateurController::class, 'index']);
        Route::post('utilisateurs', [UtilisateurController::class, 'store']);
    });
    Route::middleware('role:administrateur')->group(function () {
        Route::get('utilisateurs/{utilisateur}', [UtilisateurController::class, 'show']);
        Route::put('utilisateurs/{utilisateur}', [UtilisateurController::class, 'update']);
    });
});

Route::prefix('v1')->name('api.v1.common.')->middleware(['auth:sanctum', 'audit.api'])->group(function () {
    Route::put('mot-de-passe', [AuthController::class, 'changerMotDePasse']);
});

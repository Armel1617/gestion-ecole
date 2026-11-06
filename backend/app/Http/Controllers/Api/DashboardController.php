<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use App\Models\Formation;
use App\Models\Inscription;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    // Renvoie tous les chiffres du tableau de bord en une seule demande
    public function index()
    {
        $dashboard = Cache::remember('dashboard:summary', now()->addMinutes(2), function () {
            return $this->buildDashboard();
        });

        return response()->json($dashboard);
    }

    private function buildDashboard(): array
    {
        // --- Inscriptions des 6 derniers mois (pour le graphique) ---
        // Le mois le plus ancien : il y a 5 mois, au 1er du mois
        $debut = now()->startOfMonth()->subMonths(5);

        // On prépare 6 mois, tous à 0 : ["2026-05" => 0, "2026-06" => 0, ...]
        $mois = [];
        for ($i = 0; $i < 6; $i++) {
            $mois[$debut->copy()->addMonths($i)->format('Y-m')] = 0;
        }

        // On compte les inscriptions de chaque mois (calcul en PHP : marche avec toutes les bases)
        $dates = Inscription::where('date_inscription', '>=', $debut->toDateString())
            ->pluck('date_inscription');
        foreach ($dates as $date) {
            $cle = Carbon::parse($date)->format('Y-m');
            if (isset($mois[$cle])) {
                $mois[$cle]++;
            }
        }

        // On transforme en liste : [["mois" => "2026-05", "total" => 0], ...]
        $parMois = [];
        foreach ($mois as $cle => $total) {
            $parMois[] = ['mois' => $cle, 'total' => $total];
        }

        return [
            // Les compteurs principaux
            'total_etudiants' => Etudiant::count(),
            'total_formations' => Formation::count(),
            'total_inscriptions' => Inscription::count(),

            // Ce qui s'est passé depuis le début du mois
            'etudiants_ce_mois' => Etudiant::where('created_at', '>=', now()->startOfMonth())->count(),
            'inscriptions_ce_mois' => Inscription::where('created_at', '>=', now()->startOfMonth())->count(),

            // Nombre d'inscriptions pour chaque statut
            'inscriptions_en_cours' => Inscription::where('statut', 'en_cours')->count(),
            'inscriptions_terminees' => Inscription::where('statut', 'terminee')->count(),
            'inscriptions_annulees' => Inscription::where('statut', 'annulee')->count(),

            // Revenus estimés : somme des prix des formations pour les inscriptions non annulées
            'inscriptions_actives' => Inscription::where('statut', '!=', 'annulee')->count(),
            'revenus_estimes' => (int) Inscription::where('inscriptions.statut', '!=', 'annulee')
                ->join('formations', 'formations.id', '=', 'inscriptions.formation_id')
                ->sum('formations.prix'),

            // Les inscriptions des 6 derniers mois (graphique)
            'inscriptions_par_mois' => $parMois,

            // Les 5 formations les plus demandées
            'formations_populaires' => Formation::withCount('inscriptions')
                ->orderByDesc('inscriptions_count')
                ->take(5)
                ->get(['id', 'intitule']),

            // Les 5 derniers étudiants ajoutés
            'derniers_etudiants' => Etudiant::latest()->take(5)->get(),

            // Les 5 dernières inscriptions, avec l'étudiant et la formation
            'dernieres_inscriptions' => Inscription::with(['etudiant', 'formation'])
                ->latest()
                ->take(5)
                ->get(),
        ];
    }
}

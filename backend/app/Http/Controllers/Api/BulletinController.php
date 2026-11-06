<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscription;
use Illuminate\Http\JsonResponse;

class BulletinController extends Controller
{
    public function show(Inscription $inscription): JsonResponse
    {
        $inscription->load([
            'etudiant',
            'formation',
            'anneeAcademique',
            'notes',
            'presences',
            'paiements',
        ]);

        $totalCoefficient = (float) $inscription->notes->sum('coefficient');
        $moyenne = $totalCoefficient > 0
            ? round($inscription->notes->sum(fn ($note) => ($note->valeur / $note->bareme) * 20 * $note->coefficient) / $totalCoefficient, 2)
            : null;

        $presenceCounts = $inscription->presences->countBy(fn ($presence) => $presence->statut->value);

        return response()->json([
            'inscription' => $inscription,
            'moyenne_sur_20' => $moyenne,
            'total_notes' => $inscription->notes->count(),
            'total_coefficients' => $totalCoefficient,
            'presences' => [
                'total' => $inscription->presences->count(),
                'presentes' => $presenceCounts->get('present', 0),
                'absences' => $presenceCounts->get('absent', 0),
                'retards' => $presenceCounts->get('retard', 0),
                'excusees' => $presenceCounts->get('excuse', 0),
            ],
            'paiements_total' => $inscription->paiements
                ->filter(fn ($paiement) => $paiement->statut->value === 'paye')
                ->sum('montant'),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OperationsController extends Controller
{
    public function health(): JsonResponse
    {
        $database = 'ok';

        try {
            DB::connection()->getPdo();
        } catch (\Throwable) {
            $database = 'error';
        }

        $healthy = $database === 'ok';

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'checks' => [
                'database' => $database,
                'storage' => Storage::disk('local')->exists('.'),
                'application' => true,
            ],
        ], $healthy ? 200 : 503);
    }

    public function openApi(): JsonResponse
    {
        return response()->json([
            'openapi' => '3.0.3',
            'info' => [
                'title' => config('app.name').' API',
                'version' => '1.0.0',
            ],
            'servers' => [['url' => url('/api/v1')]],
            'security' => [['sanctum' => []]],
            'paths' => [
                '/etudiants' => ['get' => ['summary' => 'Lister les étudiants'], 'post' => ['summary' => 'Créer un étudiant']],
                '/formations' => ['get' => ['summary' => 'Lister les formations'], 'post' => ['summary' => 'Créer une formation']],
                '/inscriptions' => ['get' => ['summary' => 'Lister les inscriptions'], 'post' => ['summary' => 'Créer une inscription']],
                '/paiements' => ['get' => ['summary' => 'Lister les paiements'], 'post' => ['summary' => 'Enregistrer un paiement']],
                '/presences' => ['get' => ['summary' => 'Lister les présences'], 'post' => ['summary' => 'Enregistrer une présence']],
                '/notes' => ['get' => ['summary' => 'Lister les notes'], 'post' => ['summary' => 'Enregistrer une note']],
            ],
            'components' => [
                'securitySchemes' => [
                    'sanctum' => ['type' => 'http', 'scheme' => 'bearer'],
                ],
            ],
        ]);
    }
}

<?php

namespace App\Models;

use App\Enums\StatutPaiement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    protected $fillable = ['inscription_id', 'montant', 'date_paiement', 'reference', 'statut', 'notes'];

    protected function casts(): array
    {
        return [
            'montant' => 'integer',
            'date_paiement' => 'date',
            'statut' => StatutPaiement::class,
        ];
    }

    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class);
    }
}

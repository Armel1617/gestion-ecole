<?php

namespace App\Models;

use App\Enums\StatutPresence;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presence extends Model
{
    protected $fillable = ['inscription_id', 'date_presence', 'statut', 'minutes_retard', 'motif'];

    protected function casts(): array
    {
        return [
            'date_presence' => 'date',
            'statut' => StatutPresence::class,
            'minutes_retard' => 'integer',
        ];
    }

    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class);
    }
}

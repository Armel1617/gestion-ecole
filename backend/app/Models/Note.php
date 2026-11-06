<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    protected $fillable = ['inscription_id', 'matiere', 'valeur', 'bareme', 'coefficient', 'date_evaluation', 'commentaire'];

    protected function casts(): array
    {
        return [
            'valeur' => 'decimal:2',
            'bareme' => 'decimal:2',
            'coefficient' => 'decimal:2',
            'date_evaluation' => 'date',
        ];
    }

    public function inscription(): BelongsTo
    {
        return $this->belongsTo(Inscription::class);
    }
}

<?php

namespace App\Models;

use App\Enums\StatutInscription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inscription extends Model
{
    // Colonnes autorisées pour l'ajout et la modification
    protected $fillable = ['etudiant_id', 'formation_id', 'annee_academique_id', 'date_inscription', 'statut'];

    protected function casts(): array
    {
        return [
            'date_inscription' => 'date',
            'statut' => StatutInscription::class,
        ];
    }

    // Une inscription appartient à UN étudiant
    public function etudiant(): BelongsTo
    {
        return $this->belongsTo(Etudiant::class);
    }

    // Une inscription appartient à UNE formation
    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function anneeAcademique(): BelongsTo
    {
        return $this->belongsTo(AnneeAcademique::class);
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function presences(): HasMany
    {
        return $this->hasMany(Presence::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}

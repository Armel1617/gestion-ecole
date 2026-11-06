<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    // Colonnes qu'on a le droit de remplir depuis un formulaire (protection de Laravel)
    protected $fillable = ['user_id', 'nom', 'prenom', 'email', 'telephone', 'date_naissance'];

    protected function casts(): array
    {
        return ['date_naissance' => 'date'];
    }

    // Un étudiant a PLUSIEURS inscriptions
    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }

    // Un étudiant suit PLUSIEURS formations (en passant par la table inscriptions)
    public function formations()
    {
        return $this->belongsToMany(Formation::class, 'inscriptions')
            ->withPivot('date_inscription', 'statut'); // infos de l'inscription
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

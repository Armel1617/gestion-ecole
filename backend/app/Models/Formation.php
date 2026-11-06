<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    // Colonnes autorisées pour l'ajout et la modification
    protected $fillable = ['intitule', 'description', 'duree', 'prix'];

    // Une formation a PLUSIEURS inscriptions
    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }
}

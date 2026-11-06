<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnneeAcademiqueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'libelle' => $this->libelle,
            'date_debut' => $this->date_debut,
            'date_fin' => $this->date_fin,
            'active' => $this->active,
            'inscriptions_count' => $this->when(isset($this->inscriptions_count), $this->inscriptions_count),
        ];
    }
}

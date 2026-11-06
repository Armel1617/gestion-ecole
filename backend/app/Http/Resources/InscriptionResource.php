<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date_inscription' => $this->date_inscription,
            'statut' => $this->statut,
            'annee_academique_id' => $this->annee_academique_id,
            'annee_academique' => new AnneeAcademiqueResource($this->whenLoaded('anneeAcademique')),
            'etudiant' => new EtudiantResource($this->whenLoaded('etudiant')),
            'formation' => new FormationResource($this->whenLoaded('formation')),
            'created_at' => $this->created_at,
        ];
    }
}

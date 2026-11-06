<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'etudiant_id' => $this->etudiant_id,
            'inscription_id' => $this->inscription_id,
            'nom_original' => $this->nom_original,
            'mime_type' => $this->mime_type,
            'taille' => $this->taille,
            'created_at' => $this->created_at,
        ];
    }
}

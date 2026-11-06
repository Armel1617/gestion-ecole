<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EtudiantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'email' => $this->email,
            'telephone' => $this->telephone,
            'date_naissance' => $this->date_naissance,
            'formations' => FormationResource::collection($this->whenLoaded('formations')),
            'created_at' => $this->created_at,
        ];
    }
}

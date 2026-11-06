<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'intitule' => $this->intitule,
            'description' => $this->description,
            'duree' => $this->duree,
            'prix' => $this->prix,
            'inscriptions_count' => $this->when(isset($this->inscriptions_count), $this->inscriptions_count),
            'created_at' => $this->created_at,
        ];
    }
}

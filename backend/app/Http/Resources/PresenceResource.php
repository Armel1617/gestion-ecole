<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PresenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inscription_id' => $this->inscription_id,
            'date_presence' => $this->date_presence,
            'statut' => $this->statut,
            'minutes_retard' => $this->minutes_retard,
            'motif' => $this->motif,
            'inscription' => new InscriptionResource($this->whenLoaded('inscription')),
        ];
    }
}

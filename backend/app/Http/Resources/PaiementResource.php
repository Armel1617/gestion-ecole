<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaiementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'montant' => $this->montant,
            'date_paiement' => $this->date_paiement,
            'reference' => $this->reference,
            'statut' => $this->statut,
            'notes' => $this->notes,
            'inscription_id' => $this->inscription_id,
            'inscription' => new InscriptionResource($this->whenLoaded('inscription')),
        ];
    }
}

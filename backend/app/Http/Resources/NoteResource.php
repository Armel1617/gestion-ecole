<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inscription_id' => $this->inscription_id,
            'matiere' => $this->matiere,
            'valeur' => $this->valeur,
            'bareme' => $this->bareme,
            'coefficient' => $this->coefficient,
            'date_evaluation' => $this->date_evaluation,
            'commentaire' => $this->commentaire,
            'inscription' => new InscriptionResource($this->whenLoaded('inscription')),
        ];
    }
}

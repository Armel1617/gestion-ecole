<?php

namespace App\Http\Requests;

use App\Enums\StatutInscription;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'etudiant_id' => ['required', 'integer', 'exists:etudiants,id'],
            'formation_id' => [
                'required',
                'integer',
                'exists:formations,id',
                Rule::unique('inscriptions', 'formation_id')->where('etudiant_id', $this->integer('etudiant_id')),
            ],
            'annee_academique_id' => ['nullable', 'integer', 'exists:annees_academiques,id'],
            'date_inscription' => ['nullable', 'date'],
            'statut' => ['nullable', Rule::enum(StatutInscription::class)],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\StatutInscription;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InscriptionIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'formation_id' => ['nullable', 'integer', 'exists:formations,id'],
            'etudiant_id' => ['nullable', 'integer', 'exists:etudiants,id'],
            'statut' => ['nullable', Rule::enum(StatutInscription::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

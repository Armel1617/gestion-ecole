<?php

namespace App\Http\Requests;

use App\Enums\StatutPaiement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaiementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inscription_id' => ['required', 'integer', 'exists:inscriptions,id'],
            'montant' => ['required', 'integer', 'min:1'],
            'date_paiement' => ['nullable', 'date'],
            'reference' => ['nullable', 'string', 'max:100', 'unique:paiements,reference'],
            'statut' => ['nullable', Rule::enum(StatutPaiement::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

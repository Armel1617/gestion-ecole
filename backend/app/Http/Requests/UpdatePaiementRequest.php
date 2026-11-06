<?php

namespace App\Http\Requests;

use App\Enums\StatutPaiement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaiementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'montant' => ['required', 'integer', 'min:1'],
            'date_paiement' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:100', Rule::unique('paiements', 'reference')->ignore($this->route('paiement'))],
            'statut' => ['required', Rule::enum(StatutPaiement::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

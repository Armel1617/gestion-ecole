<?php

namespace App\Http\Requests;

use App\Enums\StatutPaiement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaiementIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inscription_id' => ['nullable', 'integer', 'exists:inscriptions,id'],
            'statut' => ['nullable', Rule::enum(StatutPaiement::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

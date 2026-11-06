<?php

namespace App\Http\Requests;

use App\Enums\StatutPresence;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PresenceIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inscription_id' => ['nullable', 'integer', 'exists:inscriptions,id'],
            'statut' => ['nullable', Rule::enum(StatutPresence::class)],
            'date_debut' => ['nullable', 'date'],
            'date_fin' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

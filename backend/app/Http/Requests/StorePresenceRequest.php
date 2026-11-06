<?php

namespace App\Http\Requests;

use App\Enums\StatutPresence;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePresenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inscription_id' => ['required', 'integer', 'exists:inscriptions,id'],
            'date_presence' => ['required', 'date'],
            'statut' => ['required', Rule::enum(StatutPresence::class)],
            'minutes_retard' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'motif' => ['nullable', 'string', 'max:500'],
        ];
    }
}

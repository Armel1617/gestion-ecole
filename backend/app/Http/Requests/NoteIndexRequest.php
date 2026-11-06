<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NoteIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inscription_id' => ['nullable', 'integer', 'exists:inscriptions,id'],
            'matiere' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

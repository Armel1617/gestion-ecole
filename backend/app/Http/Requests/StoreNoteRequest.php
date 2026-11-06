<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inscription_id' => ['required', 'integer', 'exists:inscriptions,id'],
            'matiere' => ['required', 'string', 'max:100'],
            'valeur' => ['required', 'numeric', 'min:0'],
            'bareme' => ['required', 'numeric', 'gt:0'],
            'coefficient' => ['required', 'numeric', 'gt:0', 'max:100'],
            'date_evaluation' => ['required', 'date'],
            'commentaire' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($this->filled('valeur') && $this->filled('bareme') && $this->input('valeur') > $this->input('bareme')) {
                $validator->errors()->add('valeur', 'La note ne peut pas dépasser le barème.');
            }
        });
    }
}

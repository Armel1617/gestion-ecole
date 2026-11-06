<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEtudiantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $etudiant = $this->route('etudiant');

        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('etudiants', 'email')->ignore($etudiant)],
            'telephone' => ['nullable', 'string', 'max:20'],
            'date_naissance' => ['nullable', 'date', 'before:today'],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\RoleUtilisateur;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUtilisateurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole('administrateur') === true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('utilisateur'))],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::enum(RoleUtilisateur::class)],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\RoleUtilisateur;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUtilisateurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole('administrateur', 'direction') === true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'nom' => ['required_if:role,etudiant', 'nullable', 'string', 'max:255'],
            'prenom' => ['required_if:role,etudiant', 'nullable', 'string', 'max:255'],
            'role' => [
                'required',
                Rule::enum(RoleUtilisateur::class),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if ($this->user()?->hasAnyRole('direction') && in_array($value, ['administrateur', 'direction'], true)) {
                        $fail('La direction ne peut créer que des comptes opérationnels.');
                    }
                },
            ],
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\StatutInscription;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['statut' => ['required', Rule::enum(StatutInscription::class)]];
    }
}

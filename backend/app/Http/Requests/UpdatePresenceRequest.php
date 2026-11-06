<?php

namespace App\Http\Requests;

class UpdatePresenceRequest extends StorePresenceRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'inscription_id' => ['sometimes', 'integer', 'exists:inscriptions,id'],
        ];
    }
}

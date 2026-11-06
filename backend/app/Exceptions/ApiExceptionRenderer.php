<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class ApiExceptionRenderer
{
    public static function render(\Throwable $exception): ?JsonResponse
    {
        if ($exception instanceof AuthenticationException) {
            return response()->json(['message' => 'Authentification requise.'], 401);
        }

        if ($exception instanceof ValidationException) {
            return response()->json([
                'message' => 'Les données envoyées sont invalides.',
                'errors' => $exception->errors(),
            ], 422);
        }

        if ($exception instanceof HttpExceptionInterface) {
            return response()->json([
                'message' => $exception->getMessage() ?: 'La requête ne peut pas être traitée.',
            ], $exception->getStatusCode());
        }

        return null;
    }
}

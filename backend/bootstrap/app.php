<?php

use App\Exceptions\ApiExceptionRenderer;
use App\Http\Middleware\AuditApiRequests;
use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'audit.api' => AuditApiRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Pour toutes les adresses /api/..., les erreurs sont renvoyées en JSON (jamais en page web)
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request, Throwable $e) => $request->is('api/*') || $request->expectsJson()
        );
        $exceptions->renderable(function (Throwable $exception, Request $request) {
            if ($request->is('api/*')) {
                return ApiExceptionRenderer::render($exception);
            }
        });
    })->create();

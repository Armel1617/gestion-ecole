<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditApiRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user() && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            $payload = $request->except(['password', 'password_confirmation', 'token', 'document']);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => $request->route()?->getName() ?? $request->path(),
                'method' => $request->method(),
                'route' => $request->path(),
                'status_code' => $response->getStatusCode(),
                'ip_address' => $request->ip(),
                'user_agent' => mb_substr((string) $request->userAgent(), 0, 500),
                'payload' => $payload,
            ]);
        }

        return $response;
    }
}

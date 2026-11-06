<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->notifications()->latest()->paginate($request->integer('per_page', 15)),
            'non_lues' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function read(Request $request, string $notification): JsonResponse
    {
        $updated = $request->user()->unreadNotifications()->whereKey($notification)->update(['read_at' => now()]);

        abort_unless($updated > 0, 404, 'Notification introuvable ou déjà lue.');

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['message' => 'Notifications marquées comme lues.']);
    }
}

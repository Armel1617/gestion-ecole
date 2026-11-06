<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::query()->latest();

        if ($request->filled('etudiant_id')) {
            $query->where('etudiant_id', $request->integer('etudiant_id'));
        }

        if ($request->filled('inscription_id')) {
            $query->where('inscription_id', $request->integer('inscription_id'));
        }

        return DocumentResource::collection($query->paginate($request->integer('per_page', 15)));
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $file = $request->file('document');
        $path = $file->store('documents', 'local');

        $document = Document::create([
            'etudiant_id' => $request->integer('etudiant_id'),
            'inscription_id' => $request->input('inscription_id'),
            'nom_original' => $file->getClientOriginalName(),
            'chemin' => $path,
            'mime_type' => $file->getMimeType(),
            'taille' => $file->getSize(),
        ]);

        return (new DocumentResource($document))->response()->setStatusCode(201);
    }

    public function download(Document $document)
    {
        abort_unless(Storage::disk('local')->exists($document->chemin), 404, 'Document introuvable.');

        return Storage::disk('local')->download($document->chemin, $document->nom_original);
    }

    public function destroy(Document $document): JsonResponse
    {
        Storage::disk('local')->delete($document->chemin);
        $document->delete();

        return response()->json(null, 204);
    }
}

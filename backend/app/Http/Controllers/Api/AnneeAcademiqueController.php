<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnneeAcademiqueIndexRequest;
use App\Http\Requests\StoreAnneeAcademiqueRequest;
use App\Http\Requests\UpdateAnneeAcademiqueRequest;
use App\Http\Resources\AnneeAcademiqueResource;
use App\Models\AnneeAcademique;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AnneeAcademiqueController extends Controller
{
    public function index(AnneeAcademiqueIndexRequest $request)
    {
        $query = AnneeAcademique::withCount('inscriptions')->latest('date_debut');

        if ($request->has('active')) {
            $query->where('active', $request->boolean('active'));
        }

        return AnneeAcademiqueResource::collection(
            $query->paginate($request->integer('per_page', 15))
        );
    }

    public function store(StoreAnneeAcademiqueRequest $request): JsonResponse
    {
        $annee = DB::transaction(function () use ($request): AnneeAcademique {
            $data = $request->validated();

            if (($data['active'] ?? false) === true) {
                AnneeAcademique::query()->update(['active' => false]);
            }

            return AnneeAcademique::create($data);
        });

        return (new AnneeAcademiqueResource($annee))->response()->setStatusCode(201);
    }

    public function show(AnneeAcademique $anneeAcademique): AnneeAcademiqueResource
    {
        return new AnneeAcademiqueResource($anneeAcademique->loadCount('inscriptions'));
    }

    public function update(UpdateAnneeAcademiqueRequest $request, AnneeAcademique $anneeAcademique): AnneeAcademiqueResource
    {
        DB::transaction(function () use ($request, $anneeAcademique): void {
            $data = $request->validated();

            if ($data['active'] === true) {
                AnneeAcademique::where('id', '!=', $anneeAcademique->id)->update(['active' => false]);
            }

            $anneeAcademique->update($data);
        });

        return new AnneeAcademiqueResource($anneeAcademique->refresh());
    }

    public function destroy(AnneeAcademique $anneeAcademique): JsonResponse
    {
        abort_if($anneeAcademique->inscriptions()->exists(), 422, 'Impossible de supprimer une année qui contient des inscriptions.');

        $anneeAcademique->delete();

        return response()->json(null, 204);
    }
}

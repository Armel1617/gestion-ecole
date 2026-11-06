<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('etudiants', function (Blueprint $table): void {
            $table->index(['nom', 'prenom']);
        });

        Schema::table('inscriptions', function (Blueprint $table): void {
            $table->index(['statut', 'date_inscription']);
            $table->index(['formation_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::table('etudiants', function (Blueprint $table): void {
            $table->dropIndex(['etudiants_nom_prenom_index']);
        });

        Schema::table('inscriptions', function (Blueprint $table): void {
            $table->dropIndex(['inscriptions_statut_date_inscription_index']);
            $table->dropIndex(['inscriptions_formation_id_statut_index']);
        });
    }
};

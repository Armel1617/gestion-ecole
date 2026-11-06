<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inscriptions', function (Blueprint $table): void {
            $table->foreignId('annee_academique_id')->nullable()->after('formation_id')->constrained('annees_academiques')->nullOnDelete();
            $table->index(['annee_academique_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::table('inscriptions', function (Blueprint $table): void {
            $table->dropForeign(['annee_academique_id']);
            $table->dropIndex(['annee_academique_id', 'statut']);
            $table->dropColumn('annee_academique_id');
        });
    }
};

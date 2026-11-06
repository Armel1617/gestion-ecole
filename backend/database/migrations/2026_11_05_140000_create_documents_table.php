<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('etudiant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inscription_id')->nullable()->constrained()->nullOnDelete();
            $table->string('nom_original');
            $table->string('chemin');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('taille');
            $table->timestamps();
            $table->index(['etudiant_id', 'inscription_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};

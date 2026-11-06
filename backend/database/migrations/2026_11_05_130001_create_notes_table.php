<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->cascadeOnDelete();
            $table->string('matiere', 100);
            $table->decimal('valeur', 6, 2);
            $table->decimal('bareme', 6, 2);
            $table->decimal('coefficient', 6, 2)->default(1);
            $table->date('date_evaluation');
            $table->text('commentaire')->nullable();
            $table->timestamps();
            $table->index(['inscription_id', 'matiere']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->cascadeOnDelete();
            $table->date('date_presence');
            $table->string('statut', 20)->index();
            $table->unsignedSmallInteger('minutes_retard')->default(0);
            $table->string('motif', 500)->nullable();
            $table->timestamps();
            $table->unique(['inscription_id', 'date_presence']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presences');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('inscription_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('montant');
            $table->date('date_paiement');
            $table->string('reference', 100)->nullable()->unique();
            $table->string('statut', 20)->default('paye')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['inscription_id', 'date_paiement']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};

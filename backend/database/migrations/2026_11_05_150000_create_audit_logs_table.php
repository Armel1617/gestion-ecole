<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 150);
            $table->string('method', 10);
            $table->string('route', 255);
            $table->unsignedSmallInteger('status_code');
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['route', 'status_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

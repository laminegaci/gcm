<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('constantes_vitales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations')->cascadeOnDelete();

            $table->unsignedInteger('tension_systolique')->nullable();
            $table->unsignedInteger('tension_diastolique')->nullable();
            $table->unsignedInteger('pouls')->nullable();
            $table->decimal('temperature', 4, 1)->nullable();
            $table->decimal('poids', 5, 2)->nullable();
            $table->decimal('taille', 5, 2)->nullable();
            $table->unsignedInteger('spo2')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('constantes_vitales');
    }
};

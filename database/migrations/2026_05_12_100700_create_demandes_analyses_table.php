<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes_analyses', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();

            $table->foreignId('consultation_id')->constrained('consultations')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('medecin_id')->constrained('users')->cascadeOnDelete();

            $table->string('numero_demande')->unique();
            $table->json('examens');
            $table->text('instructions_laboratoire')->nullable();
            $table->string('statut')->default('en_attente');

            $table->timestamps();
            $table->softDeletes();

            $table->index('numero_demande');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_analyses');
    }
};

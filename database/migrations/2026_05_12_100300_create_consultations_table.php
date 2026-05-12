<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();

            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('medecin_id')->constrained('users')->cascadeOnDelete();

            $table->string('motif');
            $table->text('symptomes')->nullable();
            $table->text('examen_clinique')->nullable();
            $table->text('diagnostic')->nullable();
            $table->text('notes_privees')->nullable();

            $table->string('statut')->default('en_cours');
            $table->dateTime('date_consultation');
            $table->unsignedInteger('duree_minutes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'statut']);
            $table->index('date_consultation');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};

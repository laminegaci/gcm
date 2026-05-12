<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->string('numero_ordonnance')->unique();

            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('medecin_id')->constrained('users')->cascadeOnDelete();

            $table->date('date_prescription');
            $table->date('date_expiration')->nullable();

            $table->text('diagnostic')->nullable();
            $table->text('instructions_globales')->nullable();

            $table->enum('statut', ['active', 'expiree', 'annulee'])->default('active')->index();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['patient_id', 'date_prescription']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};

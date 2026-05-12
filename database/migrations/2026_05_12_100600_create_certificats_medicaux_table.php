<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificats_medicaux', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();

            $table->foreignId('consultation_id')->constrained('consultations')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('medecin_id')->constrained('users')->cascadeOnDelete();

            $table->string('type');
            $table->unsignedInteger('nombre_jours')->nullable();
            $table->date('date_debut')->nullable();
            $table->text('contenu');

            $table->string('numero_certificat')->unique();
            $table->timestamps();
            $table->softDeletes();

            $table->index('numero_certificat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificats_medicaux');
    }
};

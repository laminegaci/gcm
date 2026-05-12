<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->string('dossier_number')->unique();
            $table->string('cin')->nullable()->index();

            $table->string('nom');
            $table->string('prenom');
            $table->enum('sexe', ['M', 'F']);
            $table->date('date_naissance');

            $table->string('telephone')->nullable()->index();
            $table->string('email')->nullable();

            $table->enum('groupe_sanguin', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->string('photo')->nullable();

            $table->enum('statut', ['actif', 'inactif'])->default('actif')->index();
            $table->text('notes')->nullable();

            $table->foreignId('medecin_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['nom', 'prenom']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};

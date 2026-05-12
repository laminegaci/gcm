<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescription_lignes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained('prescriptions')->cascadeOnDelete();

            $table->string('medicament_nom');
            $table->string('dosage');
            $table->string('frequence')->nullable();
            $table->string('duree')->nullable();
            $table->text('instructions')->nullable();

            $table->unsignedInteger('ordre')->default(0);

            $table->timestamps();

            $table->index(['prescription_id', 'ordre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescription_lignes');
    }
};

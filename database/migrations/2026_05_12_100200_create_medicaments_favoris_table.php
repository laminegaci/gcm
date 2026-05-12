<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicaments_favoris', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medecin_id')->constrained('users')->cascadeOnDelete();

            $table->string('nom');
            $table->string('dosage_defaut')->nullable();
            $table->string('frequence_defaut')->nullable();
            $table->text('instructions_defaut')->nullable();

            $table->unsignedInteger('usage_count')->default(0);

            $table->timestamps();

            $table->index(['medecin_id', 'usage_count']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicaments_favoris');
    }
};

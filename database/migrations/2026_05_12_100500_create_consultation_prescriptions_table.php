<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations')->cascadeOnDelete();
            $table->foreignId('prescription_id')->constrained('prescriptions')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['consultation_id', 'prescription_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_prescriptions');
    }
};

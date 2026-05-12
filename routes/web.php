<?php

use App\Http\Controllers\PatientController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\PrescriptionPdfController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Patients
    Route::resource('patients', PatientController::class);

    // Sous-ressources patient (allergies, contact d'urgence)
    Route::post('patients/{patient}/allergies', [PatientController::class, 'storeAllergie'])
        ->name('patients.allergies.store');
    Route::delete('patients/{patient}/allergies/{allergie}', [PatientController::class, 'destroyAllergie'])
        ->name('patients.allergies.destroy');
    Route::post('patients/{patient}/contact-urgence', [PatientController::class, 'upsertContactUrgence'])
        ->name('patients.contact-urgence.upsert');

    // Prescriptions (ordonnances)
    Route::resource('prescriptions', PrescriptionController::class);
    Route::post('prescriptions/{prescription}/duplicate', [PrescriptionController::class, 'duplicate'])
        ->name('prescriptions.duplicate');
    Route::get('prescriptions/{prescription}/pdf', [PrescriptionPdfController::class, 'show'])
        ->name('prescriptions.pdf');
    Route::get('patients/{patient}/prescriptions', function (\App\Models\Patient $patient) {
        return redirect()->route('prescriptions.index', ['patient_id' => $patient->id]);
    })->name('patients.prescriptions.index');
});

require __DIR__.'/settings.php';

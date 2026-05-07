<?php

use App\Http\Controllers\PatientController;
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
});

require __DIR__.'/settings.php';

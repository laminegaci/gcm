<?php

use App\Http\Controllers\CertificatMedicalController;
use App\Http\Controllers\CertificatPdfController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DemandeAnalyseController;
use App\Http\Controllers\DemandeAnalysePdfController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\PrescriptionPdfController;
use App\Models\Patient;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Patients
    Route::resource('patients', PatientController::class);

    Route::post('patients/{patient}/allergies', [PatientController::class, 'storeAllergie'])
        ->name('patients.allergies.store');
    Route::delete('patients/{patient}/allergies/{allergie}', [PatientController::class, 'destroyAllergie'])
        ->name('patients.allergies.destroy');
    Route::post('patients/{patient}/contact-urgence', [PatientController::class, 'upsertContactUrgence'])
        ->name('patients.contact-urgence.upsert');

    // Consultations
    Route::get('consultations', [ConsultationController::class, 'index'])
        ->name('consultations.index');
    Route::get('patients/{patient}/consultations', [ConsultationController::class, 'index'])
        ->name('patients.consultations.index');
    Route::get('consultations/create', [ConsultationController::class, 'create'])
        ->name('consultations.create');
    Route::post('consultations', [ConsultationController::class, 'store'])
        ->name('consultations.store');
    Route::get('consultations/{consultation}', [ConsultationController::class, 'show'])
        ->name('consultations.show');
    Route::put('consultations/{consultation}', [ConsultationController::class, 'update'])
        ->name('consultations.update');
    Route::delete('consultations/{consultation}', [ConsultationController::class, 'destroy'])
        ->name('consultations.destroy');
    Route::post('consultations/{consultation}/terminer', [ConsultationController::class, 'terminer'])
        ->name('consultations.terminer');

    Route::post('consultations/{consultation}/certificats', [CertificatMedicalController::class, 'store'])
        ->name('consultations.certificats.store');
    Route::put('consultations/{consultation}/certificats/{certificat}', [CertificatMedicalController::class, 'update'])
        ->name('consultations.certificats.update');
    Route::delete('consultations/{consultation}/certificats/{certificat}', [CertificatMedicalController::class, 'destroy'])
        ->name('consultations.certificats.destroy');

    Route::get('certificats/{certificat}/pdf', [CertificatPdfController::class, 'show'])
        ->name('certificats.pdf');

    Route::post('consultations/{consultation}/analyses', [DemandeAnalyseController::class, 'store'])
        ->name('consultations.analyses.store');
    Route::put('consultations/{consultation}/analyses/{analyse}', [DemandeAnalyseController::class, 'update'])
        ->name('consultations.analyses.update');
    Route::delete('consultations/{consultation}/analyses/{analyse}', [DemandeAnalyseController::class, 'destroy'])
        ->name('consultations.analyses.destroy');

    Route::get('analyses/{analyse}/pdf', [DemandeAnalysePdfController::class, 'show'])
        ->name('analyses.pdf');

    // Prescriptions (ordonnances)
    Route::resource('prescriptions', PrescriptionController::class);
    Route::post('prescriptions/{prescription}/duplicate', [PrescriptionController::class, 'duplicate'])
        ->name('prescriptions.duplicate');
    Route::get('prescriptions/{prescription}/pdf', [PrescriptionPdfController::class, 'show'])
        ->name('prescriptions.pdf');
    Route::get('patients/{patient}/prescriptions', function (Patient $patient) {
        return redirect()->route('prescriptions.index', ['patient_id' => $patient->id]);
    })->name('patients.prescriptions.index');
});

require __DIR__.'/settings.php';

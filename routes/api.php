<?php

use App\Http\Controllers\CertificatMedicalController;
use App\Http\Controllers\CertificatPdfController;
use App\Http\Controllers\ConstantesVitalesController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DemandeAnalyseController;
use App\Http\Controllers\DemandeAnalysePdfController;
use App\Http\Controllers\MedicamentFavoriController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\PrescriptionPdfController;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
 * API JSON pour les patients.
 * Auth : Sanctum recommandé. Lance `php artisan install:api` puis ajoute
 * le middleware `auth:sanctum` si tu veux activer l'auth API.
 */
Route::middleware('auth')->group(function () {
    Route::get('patients', function (Request $request) {
        $query = Patient::query()->with('medecin:id,name')->latest();

        if ($search = trim((string) $request->string('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('telephone', 'like', "%{$search}%")
                    ->orWhere('dossier_number', 'like', "%{$search}%")
                    ->orWhere('cin', 'like', "%{$search}%");
            });
        }

        foreach (['sexe', 'statut', 'medecin_id'] as $f) {
            if ($v = $request->input($f)) {
                $query->where($f, $v);
            }
        }

        return PatientResource::collection($query->paginate(20));
    })->name('api.patients.index');

    Route::get('patients/{patient}', function (Patient $patient) {
        return new PatientResource(
            $patient->load(['medecin:id,name', 'contactsUrgence', 'allergies'])
        );
    })->name('api.patients.show');

    Route::apiResource('patients', PatientController::class)
        ->only(['store', 'update', 'destroy'])
        ->names([
            'store' => 'api.patients.store',
            'update' => 'api.patients.update',
            'destroy' => 'api.patients.destroy',
        ]);

    // Prescriptions
    Route::apiResource('prescriptions', PrescriptionController::class)
        ->names([
            'index' => 'api.prescriptions.index',
            'store' => 'api.prescriptions.store',
            'show' => 'api.prescriptions.show',
            'update' => 'api.prescriptions.update',
            'destroy' => 'api.prescriptions.destroy',
        ]);
    Route::get('prescriptions/{prescription}/pdf', [PrescriptionPdfController::class, 'show'])
        ->name('api.prescriptions.pdf');

    Route::get('medicaments-favoris', [MedicamentFavoriController::class, 'index'])
        ->name('api.medicaments-favoris.index');
    Route::post('medicaments-favoris', [MedicamentFavoriController::class, 'store'])
        ->name('api.medicaments-favoris.store');
    Route::delete('medicaments-favoris/{favori}', [MedicamentFavoriController::class, 'destroy'])
        ->name('api.medicaments-favoris.destroy');

    // Consultations
    Route::get('consultations', [ConsultationController::class, 'index'])->name('api.consultations.index');
    Route::post('consultations', [ConsultationController::class, 'store'])->name('api.consultations.store');
    Route::get('consultations/{consultation}', [ConsultationController::class, 'show'])->name('api.consultations.show');
    Route::put('consultations/{consultation}', [ConsultationController::class, 'update'])->name('api.consultations.update');
    Route::delete('consultations/{consultation}', [ConsultationController::class, 'destroy'])->name('api.consultations.destroy');
    Route::post('consultations/{consultation}/terminer', [ConsultationController::class, 'terminer'])->name('api.consultations.terminer');

    Route::put('consultations/{consultation}/constantes', [ConstantesVitalesController::class, 'update'])->name('api.constantes.update');

    Route::post('consultations/{consultation}/certificats', [CertificatMedicalController::class, 'store'])->name('api.consultations.certificats.store');
    Route::put('consultations/{consultation}/certificats/{certificat}', [CertificatMedicalController::class, 'update'])->name('api.consultations.certificats.update');
    Route::delete('consultations/{consultation}/certificats/{certificat}', [CertificatMedicalController::class, 'destroy'])->name('api.consultations.certificats.destroy');
    Route::get('certificats/{certificat}/pdf', [CertificatPdfController::class, 'show'])->name('api.certificats.pdf');

    Route::post('consultations/{consultation}/analyses', [DemandeAnalyseController::class, 'store'])->name('api.consultations.analyses.store');
    Route::put('consultations/{consultation}/analyses/{analyse}', [DemandeAnalyseController::class, 'update'])->name('api.consultations.analyses.update');
    Route::delete('consultations/{consultation}/analyses/{analyse}', [DemandeAnalyseController::class, 'destroy'])->name('api.consultations.analyses.destroy');
    Route::get('analyses/{analyse}/pdf', [DemandeAnalysePdfController::class, 'show'])->name('api.analyses.pdf');
});

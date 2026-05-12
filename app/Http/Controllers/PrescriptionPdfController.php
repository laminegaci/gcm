<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class PrescriptionPdfController extends Controller
{
    public function show(Prescription $prescription): Response
    {
        $this->authorize('view', $prescription);

        $prescription->load(['patient', 'medecin', 'lignes']);

        $pdf = Pdf::loadView('pdf.ordonnance', [
            'prescription' => $prescription,
            'patient' => $prescription->patient,
            'medecin' => $prescription->medecin,
            'lignes' => $prescription->lignes,
            'clinique' => [
                'nom' => config('clinique.nom', 'Cabinet Médical'),
                'adresse' => config('clinique.adresse', ''),
                'telephone' => config('clinique.telephone', ''),
            ],
        ])->setPaper('a5', 'portrait');

        $filename = $prescription->numero_ordonnance.'.pdf';

        return $pdf->stream($filename);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\DemandeAnalyse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class DemandeAnalysePdfController extends Controller
{
    public function show(DemandeAnalyse $analyse): Response
    {
        $this->authorize('view', $analyse->consultation);

        $analyse->load(['patient', 'medecin', 'consultation']);

        $pdf = Pdf::loadView('pdf.demande_analyses', [
            'analyse' => $analyse,
            'patient' => $analyse->patient,
            'medecin' => $analyse->medecin,
            'consultation' => $analyse->consultation,
            'clinique' => [
                'nom' => config('clinique.nom', 'Cabinet Médical'),
                'adresse' => config('clinique.adresse', ''),
                'telephone' => config('clinique.telephone', ''),
            ],
        ])->setPaper('a5', 'portrait');

        return $pdf->stream($analyse->numero_demande.'.pdf');
    }
}

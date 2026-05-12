<?php

namespace App\Http\Controllers;

use App\Models\CertificatMedical;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class CertificatPdfController extends Controller
{
    public function show(CertificatMedical $certificat): Response
    {
        $this->authorize('view', $certificat->consultation);

        $certificat->load(['patient', 'medecin', 'consultation']);

        $pdf = Pdf::loadView('pdf.certificat', [
            'certificat' => $certificat,
            'patient' => $certificat->patient,
            'medecin' => $certificat->medecin,
            'consultation' => $certificat->consultation,
            'clinique' => [
                'nom' => config('clinique.nom', 'Cabinet Médical'),
                'adresse' => config('clinique.adresse', ''),
                'telephone' => config('clinique.telephone', ''),
            ],
        ])->setPaper('a5', 'portrait');

        return $pdf->stream($certificat->numero_certificat.'.pdf');
    }
}

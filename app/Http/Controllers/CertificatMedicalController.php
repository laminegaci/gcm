<?php

namespace App\Http\Controllers;

use App\Models\CertificatMedical;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CertificatMedicalController extends Controller
{
    public function store(Request $request, Consultation $consultation)
    {
        $this->authorize('update', $consultation);

        $data = $request->validate([
            'type' => ['required', Rule::in(['repos', 'aptitude', 'inaptitude', 'autre'])],
            'nombre_jours' => ['nullable', 'integer', 'min:1', 'max:365'],
            'date_debut' => ['nullable', 'date'],
            'contenu' => ['required', 'string', 'max:10000'],
        ]);

        $data['patient_id'] = $consultation->patient_id;
        $data['medecin_id'] = $request->user()->id;

        $certificat = $consultation->certificats()->create($data);

        return response()->json(['data' => $certificat], 201);
    }

    public function update(Request $request, Consultation $consultation, CertificatMedical $certificat)
    {
        $this->authorize('update', $consultation);

        abort_unless($certificat->consultation_id === $consultation->id, 404);

        $data = $request->validate([
            'type' => ['required', Rule::in(['repos', 'aptitude', 'inaptitude', 'autre'])],
            'nombre_jours' => ['nullable', 'integer', 'min:1', 'max:365'],
            'date_debut' => ['nullable', 'date'],
            'contenu' => ['required', 'string', 'max:10000'],
        ]);

        $certificat->update($data);

        return response()->json(['data' => $certificat]);
    }

    public function destroy(Consultation $consultation, CertificatMedical $certificat)
    {
        $this->authorize('update', $consultation);

        abort_unless($certificat->consultation_id === $consultation->id, 404);

        $certificat->delete();

        return response()->noContent();
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\DemandeAnalyse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DemandeAnalyseController extends Controller
{
    public function store(Request $request, Consultation $consultation)
    {
        $this->authorize('update', $consultation);

        $data = $request->validate([
            'examens' => ['required', 'array', 'min:1'],
            'examens.*.nom' => ['required', 'string', 'max:200'],
            'examens.*.code' => ['nullable', 'string', 'max:50'],
            'examens.*.urgence' => ['boolean'],
            'instructions_laboratoire' => ['nullable', 'string', 'max:2000'],
        ]);

        $data['patient_id'] = $consultation->patient_id;
        $data['medecin_id'] = $request->user()->id;

        $demande = $consultation->demandesAnalyses()->create($data);

        return response()->json(['data' => $demande], 201);
    }

    public function update(Request $request, Consultation $consultation, DemandeAnalyse $analyse)
    {
        $this->authorize('update', $consultation);

        abort_unless($analyse->consultation_id === $consultation->id, 404);

        $data = $request->validate([
            'examens' => ['required', 'array', 'min:1'],
            'examens.*.nom' => ['required', 'string', 'max:200'],
            'examens.*.code' => ['nullable', 'string', 'max:50'],
            'examens.*.urgence' => ['boolean'],
            'instructions_laboratoire' => ['nullable', 'string', 'max:2000'],
            'statut' => ['nullable', Rule::in(['en_attente', 'recu', 'annule'])],
        ]);

        $analyse->update($data);

        return response()->json(['data' => $analyse]);
    }

    public function destroy(Consultation $consultation, DemandeAnalyse $analyse)
    {
        $this->authorize('update', $consultation);

        abort_unless($analyse->consultation_id === $consultation->id, 404);

        $analyse->delete();

        return response()->noContent();
    }
}

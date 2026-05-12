<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use Illuminate\Http\Request;

class ConstantesVitalesController extends Controller
{
    public function update(Request $request, Consultation $consultation)
    {
        $this->authorize('update', $consultation);

        $data = $request->validate([
            'tension_systolique' => ['nullable', 'integer', 'min:40', 'max:250'],
            'tension_diastolique' => ['nullable', 'integer', 'min:20', 'max:150'],
            'pouls' => ['nullable', 'integer', 'min:20', 'max:250'],
            'temperature' => ['nullable', 'numeric', 'min:34', 'max:42'],
            'poids' => ['nullable', 'numeric', 'min:1', 'max:500'],
            'taille' => ['nullable', 'numeric', 'min:10', 'max:250'],
            'spo2' => ['nullable', 'integer', 'min:50', 'max:100'],
        ]);

        $constantes = $consultation->constantes()->updateOrCreate(
            ['consultation_id' => $consultation->id],
            $data,
        );

        return response()->json(['data' => [
            ...$constantes->toArray(),
            'imc' => $constantes->imc,
        ]]);
    }
}

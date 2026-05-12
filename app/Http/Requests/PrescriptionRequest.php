<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'date_prescription' => ['nullable', 'date'],
            'date_expiration' => ['nullable', 'date', 'after_or_equal:date_prescription'],
            'diagnostic' => ['nullable', 'string', 'max:2000'],
            'instructions_globales' => ['nullable', 'string', 'max:2000'],
            'statut' => ['nullable', Rule::in(['active', 'expiree', 'annulee'])],

            'lignes' => ['required', 'array', 'min:1'],
            'lignes.*.medicament_nom' => ['required', 'string', 'max:200'],
            'lignes.*.dosage' => ['required', 'string', 'max:100'],
            'lignes.*.frequence' => ['nullable', 'string', 'max:100'],
            'lignes.*.duree' => ['nullable', 'string', 'max:100'],
            'lignes.*.instructions' => ['nullable', 'string', 'max:500'],
            'lignes.*.ordre' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'lignes.required' => 'Au moins un médicament est requis.',
            'lignes.min' => 'Au moins un médicament est requis.',
            'lignes.*.medicament_nom.required' => 'Le nom du médicament est requis.',
            'lignes.*.dosage.required' => 'Le dosage est requis.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'motif' => ['required', 'string', 'max:500'],
            'symptomes' => ['nullable', 'string', 'max:5000'],
            'examen_clinique' => ['nullable', 'string', 'max:5000'],
            'diagnostic' => ['nullable', 'string', 'max:5000'],
            'notes_privees' => ['nullable', 'string', 'max:5000'],
            'statut' => ['nullable', Rule::in(['en_cours', 'terminee', 'annulee'])],
            'date_consultation' => ['nullable', 'date'],
            'duree_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],

            'tension_systolique' => ['nullable', 'integer', 'min:40', 'max:250'],
            'tension_diastolique' => ['nullable', 'integer', 'min:20', 'max:150'],
            'pouls' => ['nullable', 'integer', 'min:20', 'max:250'],
            'temperature' => ['nullable', 'numeric', 'min:34', 'max:42'],
            'poids' => ['nullable', 'numeric', 'min:1', 'max:500'],
            'taille' => ['nullable', 'numeric', 'min:10', 'max:250'],
            'spo2' => ['nullable', 'integer', 'min:50', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'motif.required' => 'Le motif de la consultation est requis.',
            'tension_systolique.required_with' => 'La tension systolique et diastolique doivent être renseignées ensemble.',
        ];
    }
}

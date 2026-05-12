<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'numero_ordonnance' => $this->numero_ordonnance,

            'patient_id' => $this->patient_id,
            'medecin_id' => $this->medecin_id,

            'date_prescription' => $this->date_prescription?->toDateString(),
            'date_expiration' => $this->date_expiration?->toDateString(),

            'diagnostic' => $this->diagnostic,
            'instructions_globales' => $this->instructions_globales,

            'statut' => $this->statut,

            'patient' => $this->whenLoaded('patient', fn () => [
                'id' => $this->patient->id,
                'nom' => $this->patient->nom,
                'prenom' => $this->patient->prenom,
                'nom_complet' => trim($this->patient->prenom.' '.$this->patient->nom),
                'date_naissance' => $this->patient->date_naissance?->toDateString(),
                'age' => $this->patient->age,
            ]),

            'medecin' => $this->whenLoaded('medecin', fn () => [
                'id' => $this->medecin->id,
                'name' => $this->medecin->name,
            ]),

            'lignes' => $this->whenLoaded('lignes', fn () => $this->lignes->map(fn ($l) => [
                'id' => $l->id,
                'medicament_nom' => $l->medicament_nom,
                'dosage' => $l->dosage,
                'frequence' => $l->frequence,
                'duree' => $l->duree,
                'instructions' => $l->instructions,
                'ordre' => $l->ordre,
            ])),

            'lignes_count' => $this->whenCounted('lignes'),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

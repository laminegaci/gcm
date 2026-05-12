<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,

            'patient_id' => $this->patient_id,
            'medecin_id' => $this->medecin_id,

            'motif' => $this->motif,
            'symptomes' => $this->symptomes,
            'examen_clinique' => $this->examen_clinique,
            'diagnostic' => $this->diagnostic,
            'notes_privees' => $this->notes_privees,

            'statut' => $this->statut,
            'date_consultation' => $this->date_consultation?->toIso8601String(),
            'duree_minutes' => $this->duree_minutes,

            'patient' => $this->whenLoaded('patient', fn () => [
                'id' => $this->patient->id,
                'nom' => $this->patient->nom,
                'prenom' => $this->patient->prenom,
                'nom_complet' => trim($this->patient->prenom.' '.$this->patient->nom),
                'date_naissance' => $this->patient->date_naissance?->toDateString(),
                'age' => $this->patient->age,
                'photo_url' => $this->patient->photo ? url('storage/'.$this->patient->photo) : null,
                'groupe_sanguin' => $this->patient->groupe_sanguin,
                'allergies' => $this->when($this->relationLoaded('patient') && $this->patient->relationLoaded('allergies'), fn () => $this->patient->allergies->map(fn ($a) => ['id' => $a->id, 'nom' => $a->nom, 'severite' => $a->severite])
                ),
            ]),

            'medecin' => $this->whenLoaded('medecin', fn () => [
                'id' => $this->medecin->id,
                'name' => $this->medecin->name,
            ]),

            'constantes' => $this->whenLoaded('constantes', fn () => [
                'id' => $this->constantes->id,
                'tension_systolique' => $this->constantes->tension_systolique,
                'tension_diastolique' => $this->constantes->tension_diastolique,
                'pouls' => $this->constantes->pouls,
                'temperature' => $this->constantes->temperature,
                'poids' => $this->constantes->poids,
                'taille' => $this->constantes->taille,
                'spo2' => $this->constantes->spo2,
                'imc' => $this->constantes->imc,
            ]),

            'prescriptions' => $this->whenLoaded('prescriptions', fn () => $this->prescriptions->map(fn ($p) => [
                'id' => $p->id,
                'numero_ordonnance' => $p->numero_ordonnance,
                'statut' => $p->statut,
                'date_prescription' => $p->date_prescription?->toDateString(),
            ])
            ),

            'certificats' => $this->whenLoaded('certificats', fn () => $this->certificats->map(fn ($c) => [
                'id' => $c->id,
                'numero_certificat' => $c->numero_certificat,
                'type' => $c->type,
                'nombre_jours' => $c->nombre_jours,
                'date_debut' => $c->date_debut?->toDateString(),
            ])
            ),

            'demandes_analyses' => $this->whenLoaded('demandesAnalyses', fn () => $this->demandesAnalyses->map(fn ($d) => [
                'id' => $d->id,
                'numero_demande' => $d->numero_demande,
                'examens' => $d->examens,
                'statut' => $d->statut,
            ])
            ),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

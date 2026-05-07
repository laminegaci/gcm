<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'dossier_number' => $this->dossier_number,
            'cin' => $this->cin,

            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'nom_complet' => trim($this->prenom.' '.$this->nom),
            'sexe' => $this->sexe,
            'date_naissance' => $this->date_naissance?->toDateString(),
            'age' => $this->age,

            'telephone' => $this->telephone,
            'email' => $this->email,
            'groupe_sanguin' => $this->groupe_sanguin,
            'photo_url' => $this->photo ? Storage::url($this->photo) : null,

            'statut' => $this->statut,
            'notes' => $this->notes,

            'medecin' => $this->whenLoaded('medecin', fn () => [
                'id' => $this->medecin->id,
                'name' => $this->medecin->name,
            ]),

            'contacts_urgence' => $this->whenLoaded('contactsUrgence', fn () => $this->contactsUrgence->map(fn ($c) => [
                'id' => $c->id,
                'nom' => $c->nom,
                'telephone' => $c->telephone,
                'relation' => $c->relation,
            ])),

            'allergies' => $this->whenLoaded('allergies', fn () => $this->allergies->map(fn ($a) => [
                'id' => $a->id,
                'nom' => $a->nom,
                'severite' => $a->severite,
            ])),

            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable([
    'uuid', 'patient_id', 'medecin_id',
    'motif', 'symptomes', 'examen_clinique', 'diagnostic', 'notes_privees',
    'statut', 'date_consultation', 'duree_minutes',
])]
class Consultation extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'date_consultation' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Consultation $c) {
            $c->uuid ??= (string) Str::uuid();
            $c->date_consultation ??= now();
        });
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    public function constantes(): HasOne
    {
        return $this->hasOne(ConstantesVitales::class, 'consultation_id');
    }

    public function prescriptions(): BelongsToMany
    {
        return $this->belongsToMany(Prescription::class, 'consultation_prescriptions')
            ->withTimestamps();
    }

    public function certificats(): HasMany
    {
        return $this->hasMany(CertificatMedical::class);
    }

    public function demandesAnalyses(): HasMany
    {
        return $this->hasMany(DemandeAnalyse::class);
    }
}

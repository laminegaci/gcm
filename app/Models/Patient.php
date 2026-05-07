<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

#[Fillable([
    'uuid', 'dossier_number', 'cin',
    'nom', 'prenom', 'sexe', 'date_naissance',
    'telephone', 'email',
    'groupe_sanguin', 'photo',
    'statut', 'notes',
    'medecin_id',
])]
class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Patient $patient) {
            $patient->uuid ??= (string) Str::uuid();
            $patient->dossier_number ??= self::generateDossierNumber();
        });
    }

    public static function generateDossierNumber(): string
    {
        do {
            $candidate = 'DOS-'.now()->format('Y').'-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('dossier_number', $candidate)->exists());

        return $candidate;
    }

    public function age(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->date_naissance
                ? Carbon::parse($this->date_naissance)->age
                : null,
        );
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    public function contactsUrgence(): HasMany
    {
        return $this->hasMany(PatientContactUrgence::class);
    }

    public function allergies(): HasMany
    {
        return $this->hasMany(Allergie::class);
    }
}

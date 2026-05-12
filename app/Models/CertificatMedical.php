<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable([
    'uuid', 'consultation_id', 'patient_id', 'medecin_id',
    'type', 'nombre_jours', 'date_debut', 'contenu',
    'numero_certificat',
])]
class CertificatMedical extends Model
{
    use SoftDeletes;

    protected $table = 'certificats_medicaux';

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (CertificatMedical $c) {
            $c->uuid ??= (string) Str::uuid();
            $c->numero_certificat ??= self::generateNumero();
        });
    }

    public static function generateNumero(): string
    {
        $year = now()->format('Y');
        $last = self::where('numero_certificat', 'like', "CERT-{$year}-%")
            ->orderByDesc('id')
            ->value('numero_certificat');

        $next = $last ? ((int) substr($last, -5)) + 1 : 1;

        return sprintf('CERT-%s-%05d', $year, $next);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }
}

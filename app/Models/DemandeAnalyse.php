<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable([
    'uuid', 'consultation_id', 'patient_id', 'medecin_id',
    'numero_demande', 'examens', 'instructions_laboratoire', 'statut',
])]
class DemandeAnalyse extends Model
{
    use SoftDeletes;

    protected $table = 'demandes_analyses';

    protected function casts(): array
    {
        return [
            'examens' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (DemandeAnalyse $d) {
            $d->uuid ??= (string) Str::uuid();
            $d->numero_demande ??= self::generateNumero();
        });
    }

    public static function generateNumero(): string
    {
        $year = now()->format('Y');
        $last = self::where('numero_demande', 'like', "ANA-{$year}-%")
            ->orderByDesc('id')
            ->value('numero_demande');

        $next = $last ? ((int) substr($last, -5)) + 1 : 1;

        return sprintf('ANA-%s-%05d', $year, $next);
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

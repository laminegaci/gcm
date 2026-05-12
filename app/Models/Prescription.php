<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable([
    'uuid', 'numero_ordonnance',
    'patient_id', 'medecin_id',
    'date_prescription', 'date_expiration',
    'diagnostic', 'instructions_globales',
    'statut',
])]
class Prescription extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'date_prescription' => 'date',
            'date_expiration' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Prescription $p) {
            $p->uuid ??= (string) Str::uuid();
            $p->numero_ordonnance ??= self::generateNumero();
            $p->date_prescription ??= now()->toDateString();
            $p->date_expiration ??= now()->parse($p->date_prescription)->addMonths(3)->toDateString();
            $p->statut ??= 'active';
        });
    }

    public static function generateNumero(): string
    {
        $year = now()->format('Y');
        $last = self::where('numero_ordonnance', 'like', "ORD-{$year}-%")
            ->orderByDesc('id')
            ->value('numero_ordonnance');

        $next = $last ? ((int) substr($last, -5)) + 1 : 1;

        return sprintf('ORD-%s-%05d', $year, $next);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    public function lignes(): HasMany
    {
        return $this->hasMany(PrescriptionLigne::class)->orderBy('ordre');
    }
}

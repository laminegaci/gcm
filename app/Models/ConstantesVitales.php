<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'consultation_id',
    'tension_systolique', 'tension_diastolique',
    'pouls', 'temperature', 'poids', 'taille', 'spo2',
])]
class ConstantesVitales extends Model
{
    protected $table = 'constantes_vitales';

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function imc(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->poids === null || $this->taille === null || $this->taille == 0) {
                    return null;
                }
                $tailleM = $this->taille / 100;

                return round($this->poids / ($tailleM * $tailleM), 1);
            },
        );
    }
}

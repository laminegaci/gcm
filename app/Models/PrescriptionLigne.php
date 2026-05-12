<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'prescription_id',
    'medicament_nom', 'dosage', 'frequence', 'duree', 'instructions',
    'ordre',
])]
class PrescriptionLigne extends Model
{
    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }
}

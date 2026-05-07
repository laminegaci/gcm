<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['patient_id', 'nom', 'severite'])]
class Allergie extends Model
{
    protected $table = 'allergies';

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}

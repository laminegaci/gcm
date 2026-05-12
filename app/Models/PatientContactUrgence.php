<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['patient_id', 'nom', 'telephone', 'relation'])]
class PatientContactUrgence extends Model
{
    protected $table = 'patient_contacts_urgence';

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'medecin_id',
    'nom', 'dosage_defaut', 'frequence_defaut', 'instructions_defaut',
    'usage_count',
])]
class MedicamentFavori extends Model
{
    protected $table = 'medicaments_favoris';

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }
}

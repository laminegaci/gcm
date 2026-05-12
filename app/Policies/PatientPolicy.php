<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin', 'secretaire'], true);
    }

    public function view(User $user, Patient $patient): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'secretaire'], true);
    }

    /**
     * Update — admin: tout, médecin: champs médicaux uniquement,
     * secrétaire: champs administratifs uniquement.
     * La granularité par champ est appliquée au niveau du contrôleur
     * (filterFieldsForRole). Ici on autorise simplement l'action.
     */
    public function update(User $user, Patient $patient): bool
    {
        return in_array($user->role, ['admin', 'medecin', 'secretaire'], true);
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Patient $patient): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Patient $patient): bool
    {
        return $user->role === 'admin';
    }
}

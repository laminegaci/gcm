<?php

namespace App\Policies;

use App\Models\Consultation;
use App\Models\User;

class ConsultationPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin', 'secretaire'], true);
    }

    public function view(User $user, Consultation $consultation): bool
    {
        return in_array($user->role, ['admin', 'medecin', 'secretaire'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin'], true);
    }

    public function update(User $user, Consultation $consultation): bool
    {
        if ($consultation->statut !== 'en_cours') {
            return false;
        }

        return $user->role === 'admin' || $user->id === $consultation->medecin_id;
    }

    public function delete(User $user, Consultation $consultation): bool
    {
        return $user->role === 'admin' || $user->id === $consultation->medecin_id;
    }

    public function terminer(User $user, Consultation $consultation): bool
    {
        if ($consultation->statut !== 'en_cours') {
            return false;
        }

        return $user->role === 'admin' || $user->id === $consultation->medecin_id;
    }
}

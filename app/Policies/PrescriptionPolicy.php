<?php

namespace App\Policies;

use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin', 'secretaire'], true);
    }

    public function view(User $user, Prescription $prescription): bool
    {
        return in_array($user->role, ['admin', 'medecin', 'secretaire'], true);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'medecin'], true);
    }

    public function update(User $user, Prescription $prescription): bool
    {
        return $user->role === 'admin' || $user->id === $prescription->medecin_id;
    }

    public function delete(User $user, Prescription $prescription): bool
    {
        return $user->role === 'admin' || $user->id === $prescription->medecin_id;
    }

    public function restore(User $user, Prescription $prescription): bool
    {
        return $user->role === 'admin';
    }
}

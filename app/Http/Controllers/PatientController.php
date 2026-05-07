<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientRequest;
use App\Http\Resources\PatientResource;
use App\Models\Allergie;
use App\Models\Patient;
use App\Models\PatientContactUrgence;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    /** Champs modifiables par rôle. */
    private const MEDICAL_FIELDS = ['groupe_sanguin', 'notes', 'medecin_id'];

    private const ADMIN_FIELDS = [
        'nom', 'prenom', 'sexe', 'date_naissance', 'cin',
        'telephone', 'email', 'photo', 'statut',
    ];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Patient::class);

        $query = Patient::query()
            ->with('medecin:id,name')
            ->latest();

        if ($search = trim((string) $request->string('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('telephone', 'like', "%{$search}%")
                    ->orWhere('dossier_number', 'like', "%{$search}%")
                    ->orWhere('cin', 'like', "%{$search}%");
            });
        }

        if ($sexe = $request->string('sexe')->toString()) {
            $query->where('sexe', $sexe);
        }

        if ($statut = $request->string('statut')->toString()) {
            $query->where('statut', $statut);
        }

        if ($medecinId = $request->integer('medecin_id')) {
            $query->where('medecin_id', $medecinId);
        }

        $patients = $query->paginate(20)->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => PatientResource::collection($patients),
            'filters' => $request->only(['search', 'sexe', 'statut', 'medecin_id']),
            'medecins' => User::where('role', 'medecin')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Patient::class);

        return Inertia::render('patients/create', [
            'medecins' => User::where('role', 'medecin')->get(['id', 'name']),
        ]);
    }

    public function store(PatientRequest $request): RedirectResponse
    {
        $this->authorize('create', Patient::class);

        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('patients', 'public');
        }

        $patient = Patient::create($data);

        return to_route('patients.show', $patient)
            ->with('toast', ['type' => 'success', 'message' => 'Patient créé avec succès.']);
    }

    public function show(Patient $patient): Response
    {
        $this->authorize('view', $patient);

        $patient->load(['medecin:id,name', 'contactsUrgence', 'allergies']);

        return Inertia::render('patients/show', [
            'patient' => new PatientResource($patient),
        ]);
    }

    public function update(PatientRequest $request, Patient $patient): RedirectResponse
    {
        $this->authorize('update', $patient);

        $data = $this->filterFieldsForRole($request->validated(), $request->user());

        if ($request->hasFile('photo') && in_array('photo', self::ADMIN_FIELDS, true)) {
            $data['photo'] = $request->file('photo')->store('patients', 'public');
        }

        $patient->update($data);

        return back()->with('toast', ['type' => 'success', 'message' => 'Patient mis à jour.']);
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        $this->authorize('delete', $patient);

        $patient->delete();

        return to_route('patients.index')
            ->with('toast', ['type' => 'success', 'message' => 'Patient archivé.']);
    }

    /* -----------------------------------------------------------
     |  Sous-ressources : allergies & contact d'urgence
     |  (CRUD simple appelé depuis le profil patient)
     | ----------------------------------------------------------- */

    public function storeAllergie(Request $request, Patient $patient): RedirectResponse
    {
        $this->authorize('update', $patient);

        $data = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'severite' => ['required', 'in:legere,moderee,severe'],
        ]);

        $patient->allergies()->create($data);

        return back();
    }

    public function destroyAllergie(Patient $patient, Allergie $allergie): RedirectResponse
    {
        $this->authorize('update', $patient);
        abort_unless($allergie->patient_id === $patient->id, 404);

        $allergie->delete();

        return back();
    }

    public function upsertContactUrgence(Request $request, Patient $patient): RedirectResponse
    {
        $this->authorize('update', $patient);

        $data = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30'],
            'relation' => ['nullable', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($patient, $data) {
            $patient->contactsUrgence()->delete();
            $patient->contactsUrgence()->create($data);
        });

        return back();
    }

    /**
     * Restreint les champs en update selon le rôle.
     * - admin : tout
     * - medecin : champs médicaux uniquement
     * - secretaire : champs administratifs uniquement
     */
    private function filterFieldsForRole(array $data, ?User $user): array
    {
        if (! $user || $user->role === 'admin') {
            return $data;
        }

        $allowed = match ($user->role) {
            'medecin' => self::MEDICAL_FIELDS,
            'secretaire' => self::ADMIN_FIELDS,
            default => [],
        };

        return array_intersect_key($data, array_flip($allowed));
    }
}

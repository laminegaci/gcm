<?php

namespace App\Http\Controllers;

use App\Http\Requests\PrescriptionRequest;
use App\Http\Resources\PrescriptionResource;
use App\Models\MedicamentFavori;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PrescriptionLigne;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Prescription::class);

        $query = Prescription::query()
            ->with(['patient:id,nom,prenom,date_naissance', 'medecin:id,name'])
            ->withCount('lignes')
            ->latest('date_prescription');

        if ($patientId = $request->integer('patient_id')) {
            $query->where('patient_id', $patientId);
        }
        if ($statut = $request->string('statut')->toString()) {
            $query->where('statut', $statut);
        }
        if ($date = $request->string('date')->toString()) {
            $query->whereDate('date_prescription', $date);
        }

        $prescriptions = $query->paginate(20)->withQueryString();

        if ($request->wantsJson()) {
            return PrescriptionResource::collection($prescriptions);
        }

        $patient = $patientId ? Patient::find($patientId) : null;

        return Inertia::render('prescriptions/index', [
            'prescriptions' => PrescriptionResource::collection($prescriptions),
            'filters' => $request->only(['patient_id', 'statut', 'date']),
            'patient' => $patient ? [
                'id' => $patient->id,
                'nom_complet' => trim($patient->prenom.' '.$patient->nom),
            ] : null,
            'breadcrumbs' => array_filter([
                ['title' => 'Patients', 'href' => route('patients.index')],
                $patient ? ['title' => trim($patient->prenom.' '.$patient->nom), 'href' => route('patients.show', $patient)] : null,
                ['title' => 'Ordonnances', 'href' => '#'],
            ]),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Prescription::class);

        $patientId = $request->integer('patient_id');
        $patient = $patientId ? Patient::find($patientId) : null;

        $favoris = MedicamentFavori::query()
            ->where('medecin_id', $request->user()->id)
            ->orderByDesc('usage_count')
            ->orderBy('nom')
            ->get();

        return Inertia::render('prescriptions/create', [
            'patient' => $patient ? [
                'id' => $patient->id,
                'nom_complet' => trim($patient->prenom.' '.$patient->nom),
            ] : null,
            'patients' => Patient::orderBy('nom')->get(['id', 'nom', 'prenom']),
            'favoris' => $favoris,
            'breadcrumbs' => [
                ['title' => 'Ordonnances', 'href' => route('prescriptions.index')],
                ['title' => 'Nouvelle ordonnance', 'href' => route('prescriptions.create')],
            ],
        ]);
    }

    public function store(PrescriptionRequest $request)
    {
        $this->authorize('create', Prescription::class);

        $data = $request->validated();
        $lignes = $data['lignes'];
        unset($data['lignes']);

        $data['medecin_id'] = $request->user()->id;

        $prescription = DB::transaction(function () use ($data, $lignes, $request) {
            $p = Prescription::create($data);

            foreach ($lignes as $i => $ligne) {
                $p->lignes()->create([
                    'medicament_nom' => $ligne['medicament_nom'],
                    'dosage' => $ligne['dosage'],
                    'frequence' => $ligne['frequence'] ?? null,
                    'duree' => $ligne['duree'] ?? null,
                    'instructions' => $ligne['instructions'] ?? null,
                    'ordre' => $ligne['ordre'] ?? $i,
                ]);

                $fav = MedicamentFavori::where('medecin_id', $request->user()->id)
                    ->where('nom', $ligne['medicament_nom'])
                    ->first();
                if ($fav) {
                    $fav->increment('usage_count');
                }
            }

            return $p;
        });

        if ($request->wantsJson()) {
            return new PrescriptionResource($prescription->load(['patient', 'medecin', 'lignes']));
        }

        return to_route('prescriptions.show', $prescription)
            ->with('toast', ['type' => 'success', 'message' => 'Ordonnance créée avec succès.']);
    }

    public function show(Prescription $prescription)
    {
        $this->authorize('view', $prescription);

        $prescription->load(['patient', 'medecin:id,name', 'lignes']);

        if (request()->wantsJson()) {
            return new PrescriptionResource($prescription);
        }

        return Inertia::render('prescriptions/show', [
            'prescription' => new PrescriptionResource($prescription),
            'breadcrumbs' => [
                ['title' => 'Patients', 'href' => route('patients.index')],
                ['title' => trim($prescription->patient->prenom.' '.$prescription->patient->nom), 'href' => route('patients.show', $prescription->patient)],
                ['title' => $prescription->numero_ordonnance, 'href' => route('prescriptions.show', $prescription)],
            ],
        ]);
    }

    public function edit(Prescription $prescription): Response
    {
        $this->authorize('update', $prescription);

        $prescription->load(['patient', 'medecin:id,name', 'lignes']);

        $favoris = MedicamentFavori::query()
            ->where('medecin_id', request()->user()->id)
            ->orderByDesc('usage_count')
            ->get();

        return Inertia::render('prescriptions/create', [
            'prescription' => new PrescriptionResource($prescription),
            'patient' => [
                'id' => $prescription->patient->id,
                'nom_complet' => trim($prescription->patient->prenom.' '.$prescription->patient->nom),
            ],
            'patients' => Patient::orderBy('nom')->get(['id', 'nom', 'prenom']),
            'favoris' => $favoris,
            'breadcrumbs' => [
                ['title' => 'Ordonnances', 'href' => route('prescriptions.index')],
                ['title' => $prescription->numero_ordonnance, 'href' => route('prescriptions.show', $prescription)],
                ['title' => 'Modifier', 'href' => '#'],
            ],
        ]);
    }

    public function update(PrescriptionRequest $request, Prescription $prescription)
    {
        $this->authorize('update', $prescription);

        $data = $request->validated();
        $lignes = $data['lignes'];
        unset($data['lignes']);

        DB::transaction(function () use ($prescription, $data, $lignes) {
            $prescription->update($data);
            $prescription->lignes()->delete();
            foreach ($lignes as $i => $ligne) {
                $prescription->lignes()->create([
                    'medicament_nom' => $ligne['medicament_nom'],
                    'dosage' => $ligne['dosage'],
                    'frequence' => $ligne['frequence'] ?? null,
                    'duree' => $ligne['duree'] ?? null,
                    'instructions' => $ligne['instructions'] ?? null,
                    'ordre' => $ligne['ordre'] ?? $i,
                ]);
            }
        });

        if ($request->wantsJson()) {
            return new PrescriptionResource($prescription->fresh()->load(['patient', 'medecin', 'lignes']));
        }

        return to_route('prescriptions.show', $prescription)
            ->with('toast', ['type' => 'success', 'message' => 'Ordonnance mise à jour.']);
    }

    public function destroy(Prescription $prescription)
    {
        $this->authorize('delete', $prescription);

        $prescription->delete();

        if (request()->wantsJson()) {
            return response()->noContent();
        }

        return to_route('prescriptions.index')
            ->with('toast', ['type' => 'success', 'message' => 'Ordonnance supprimée.']);
    }

    public function duplicate(Prescription $prescription): RedirectResponse
    {
        $this->authorize('create', Prescription::class);

        $copy = DB::transaction(function () use ($prescription) {
            $new = Prescription::create([
                'patient_id' => $prescription->patient_id,
                'medecin_id' => request()->user()->id,
                'diagnostic' => $prescription->diagnostic,
                'instructions_globales' => $prescription->instructions_globales,
            ]);

            foreach ($prescription->lignes as $l) {
                $new->lignes()->create([
                    'medicament_nom' => $l->medicament_nom,
                    'dosage' => $l->dosage,
                    'frequence' => $l->frequence,
                    'duree' => $l->duree,
                    'instructions' => $l->instructions,
                    'ordre' => $l->ordre,
                ]);
            }

            return $new;
        });

        return to_route('prescriptions.edit', $copy)
            ->with('toast', ['type' => 'success', 'message' => 'Ordonnance dupliquée.']);
    }
}

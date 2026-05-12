<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConsultationRequest;
use App\Http\Resources\ConsultationResource;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Consultation::class);

        $query = Consultation::query()
            ->with(['patient:id,nom,prenom,date_naissance', 'medecin:id,name'])
            ->latest('date_consultation');

        $patientId = $request->route('patient')
            ? ($request->route('patient') instanceof Patient ? $request->route('patient')->id : (int) $request->route('patient'))
            : ($request->integer('patient_id') ?: null);

        if ($patientId) {
            $query->where('patient_id', $patientId);
        }

        $patient = $patientId ? Patient::find($patientId) : null;

        if ($statut = $request->string('statut')->toString()) {
            $query->where('statut', $statut);
        }

        $consultations = $query->paginate(15)->withQueryString();

        return Inertia::render('consultations/index', [
            'consultations' => ConsultationResource::collection($consultations),
            'filters' => $request->only(['statut']),
            'patient' => $patient ? [
                'id' => $patient->id,
                'nom_complet' => trim($patient->prenom.' '.$patient->nom),
            ] : null,
            'breadcrumbs' => array_filter([
                ['title' => 'Patients', 'href' => route('patients.index')],
                $patient ? ['title' => trim($patient->prenom.' '.$patient->nom), 'href' => route('patients.show', $patient)] : null,
                ['title' => 'Consultations', 'href' => '#'],
            ]),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Consultation::class);

        $patientId = $request->integer('patient_id');
        $patient = $patientId ? Patient::with('allergies')->find($patientId) : null;

        $lastConsultation = null;
        $activePrescriptions = [];

        if ($patient) {
            $lastConsultation = Consultation::where('patient_id', $patient->id)
                ->where('statut', 'terminee')
                ->with('constantes')
                ->latest('date_consultation')
                ->first();

            $activePrescriptions = Prescription::where('patient_id', $patient->id)
                ->where('statut', 'active')
                ->with('lignes')
                ->latest('date_prescription')
                ->get();
        }

        return Inertia::render('consultations/create', [
            'patient' => $patient ? [
                'id' => $patient->id,
                'nom_complet' => trim($patient->prenom.' '.$patient->nom),
                'nom' => $patient->nom,
                'prenom' => $patient->prenom,
                'date_naissance' => $patient->date_naissance?->toDateString(),
                'age' => $patient->age,
                'sexe' => $patient->sexe,
                'groupe_sanguin' => $patient->groupe_sanguin,
                'photo_url' => $patient->photo ? url('storage/'.$patient->photo) : null,
                'allergies' => $patient->allergies->map(fn ($a) => [
                    'id' => $a->id,
                    'nom' => $a->nom,
                    'severite' => $a->severite,
                ]),
            ] : null,
            'lastConsultation' => $lastConsultation ? [
                'date_consultation' => $lastConsultation->date_consultation?->toDateString(),
                'diagnostic' => $lastConsultation->diagnostic,
            ] : null,
            'activePrescriptions' => $activePrescriptions->map(fn ($p) => [
                'id' => $p->id,
                'numero_ordonnance' => $p->numero_ordonnance,
                'lignes' => $p->lignes->map(fn ($l) => $l->medicament_nom),
            ]),
            'breadcrumbs' => [
                ['title' => 'Consultations', 'href' => route('consultations.index')],
                ['title' => 'Nouvelle consultation', 'href' => '#'],
            ],
        ]);
    }

    public function store(ConsultationRequest $request)
    {
        $this->authorize('create', Consultation::class);

        $data = $request->validated();

        $constantesData = [
            'tension_systolique' => $data['tension_systolique'] ?? null,
            'tension_diastolique' => $data['tension_diastolique'] ?? null,
            'pouls' => $data['pouls'] ?? null,
            'temperature' => $data['temperature'] ?? null,
            'poids' => $data['poids'] ?? null,
            'taille' => $data['taille'] ?? null,
            'spo2' => $data['spo2'] ?? null,
        ];
        unset($data['tension_systolique'], $data['tension_diastolique'],
            $data['pouls'], $data['temperature'],
            $data['poids'], $data['taille'], $data['spo2']);

        $data['medecin_id'] = $request->user()->id;

        $consultation = DB::transaction(function () use ($data, $constantesData) {
            $c = Consultation::create($data);

            if (array_filter($constantesData, fn ($v) => $v !== null)) {
                $c->constantes()->create($constantesData);
            }

            return $c;
        });

        if ($request->wantsJson()) {
            return new ConsultationResource(
                $consultation->load(['patient', 'medecin', 'constantes'])
            );
        }

        return to_route('consultations.show', $consultation)
            ->with('toast', ['type' => 'success', 'message' => 'Consultation créée.']);
    }

    public function show(Consultation $consultation)
    {
        $this->authorize('view', $consultation);

        $consultation->load([
            'patient' => fn ($q) => $q->with('allergies'),
            'medecin:id,name',
            'constantes',
            'prescriptions',
            'certificats',
            'demandesAnalyses',
        ]);

        if (request()->wantsJson()) {
            return new ConsultationResource($consultation);
        }

        return Inertia::render('consultations/show', [
            'consultation' => new ConsultationResource($consultation),
            'breadcrumbs' => [
                ['title' => 'Patients', 'href' => route('patients.index')],
                ['title' => trim($consultation->patient->prenom.' '.$consultation->patient->nom), 'href' => route('patients.show', $consultation->patient)],
                ['title' => 'Consultation du '.$consultation->date_consultation?->format('d/m/Y'), 'href' => '#'],
            ],
        ]);
    }

    public function update(ConsultationRequest $request, Consultation $consultation)
    {
        $this->authorize('update', $consultation);

        $data = $request->validated();

        $constantesData = [
            'tension_systolique' => $data['tension_systolique'] ?? null,
            'tension_diastolique' => $data['tension_diastolique'] ?? null,
            'pouls' => $data['pouls'] ?? null,
            'temperature' => $data['temperature'] ?? null,
            'poids' => $data['poids'] ?? null,
            'taille' => $data['taille'] ?? null,
            'spo2' => $data['spo2'] ?? null,
        ];
        unset($data['tension_systolique'], $data['tension_diastolique'],
            $data['pouls'], $data['temperature'],
            $data['poids'], $data['taille'], $data['spo2']);

        DB::transaction(function () use ($consultation, $data, $constantesData) {
            $consultation->update($data);

            $hasConstantes = array_filter($constantesData, fn ($v) => $v !== null);
            if ($hasConstantes) {
                $consultation->constantes()->updateOrCreate(
                    ['consultation_id' => $consultation->id],
                    $constantesData,
                );
            }
        });

        if ($request->wantsJson()) {
            return new ConsultationResource(
                $consultation->fresh()->load(['patient', 'medecin', 'constantes', 'prescriptions', 'certificats', 'demandesAnalyses'])
            );
        }

        return to_route('consultations.show', $consultation)
            ->with('toast', ['type' => 'success', 'message' => 'Consultation mise à jour.']);
    }

    public function destroy(Consultation $consultation)
    {
        $this->authorize('delete', $consultation);

        $consultation->delete();

        if (request()->wantsJson()) {
            return response()->noContent();
        }

        return to_route('consultations.index')
            ->with('toast', ['type' => 'success', 'message' => 'Consultation supprimée.']);
    }

    public function terminer(Request $request, Consultation $consultation)
    {
        $this->authorize('terminer', $consultation);

        $consultation->update(['statut' => 'terminee']);

        if ($request->wantsJson()) {
            return new ConsultationResource($consultation->fresh()->load(['patient', 'medecin', 'constantes']));
        }

        return to_route('consultations.show', $consultation)
            ->with('toast', ['type' => 'success', 'message' => 'Consultation terminée.']);
    }
}

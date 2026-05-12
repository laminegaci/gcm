<?php

namespace Database\Seeders;

use App\Models\CertificatMedical;
use App\Models\Consultation;
use App\Models\DemandeAnalyse;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;

class ConsultationSeeder extends Seeder
{
    public function run(): void
    {
        $medecin = User::where('role', 'medecin')->first()
            ?? User::factory()->create([
                'name' => 'Dr. Sarah Bennani',
                'email' => 'medecin@example.com',
                'role' => 'medecin',
            ]);

        $patients = Patient::limit(5)->get();
        if ($patients->isEmpty()) {
            return;
        }

        $motifs = [
            'Consultation générale',
            'Suivi hypertension',
            'Douleurs lombaires',
            'Infection respiratoire',
            'Bilan annuel',
            'Maux de tête persistants',
            'Suivi diabète',
            'Problèmes digestifs',
            'Allergie saisonnière',
            'Contrôle de routine',
            'Fatigue chronique',
            'Douleurs articulaires',
            'Préparation sportive',
            'Suivi post-opératoire',
            'Troubles du sommeil',
            'Consultation pédiatrique',
            'Vérification tension',
            'Problèmes cutanés',
            'Suivi thyroïde',
            'Certificat médical',
        ];

        foreach ($patients as $pi => $patient) {
            $numConsultations = min(4, $pi + 1);

            for ($ci = 0; $ci < $numConsultations; $ci++) {
                $statut = $ci === $numConsultations - 1 ? 'en_cours' : 'terminee';
                $date = now()->subDays(($numConsultations - $ci) * random_int(3, 15));

                $consultation = Consultation::create([
                    'patient_id' => $patient->id,
                    'medecin_id' => $medecin->id,
                    'motif' => $motifs[array_rand($motifs)],
                    'symptomes' => $ci % 2 === 0 ? 'Patient présente des symptômes modérés évoluant depuis quelques jours.' : null,
                    'examen_clinique' => $ci % 3 === 0 ? 'Examen clinique sans particularité notable. Auscultation normale.' : null,
                    'diagnostic' => $ci % 2 === 0 ? 'Diagnostic provisoire — à confirmer par examens complémentaires.' : 'Pas de pathologie détectée.',
                    'notes_privees' => $ci === 0 && $pi === 0 ? 'Patient anxieux — à surveiller.' : null,
                    'statut' => $statut,
                    'date_consultation' => $date,
                    'duree_minutes' => random_int(15, 45),
                ]);

                if ($ci > 0) {
                    $consultation->constantes()->create([
                        'tension_systolique' => random_int(110, 140),
                        'tension_diastolique' => random_int(60, 90),
                        'pouls' => random_int(60, 100),
                        'temperature' => round(36.5 + (float) random_int(0, 20) / 10, 1),
                        'poids' => round(60 + (float) random_int(0, 400) / 10, 1),
                        'taille' => round(155 + (float) random_int(0, 400) / 10, 1),
                        'spo2' => random_int(95, 100),
                    ]);
                }

                if ($ci === 0 && $pi < 3) {
                    CertificatMedical::create([
                        'consultation_id' => $consultation->id,
                        'patient_id' => $patient->id,
                        'medecin_id' => $medecin->id,
                        'type' => 'repos',
                        'nombre_jours' => random_int(3, 10),
                        'date_debut' => $date->copy()->addDay()->toDateString(),
                        'contenu' => 'Patient nécessitant un repos absolu pour raison médicale. Arrêt de travail prescrit pour la durée indiquée.',
                    ]);
                }

                if ($ci === 0 && $pi >= 2 && $pi < 5) {
                    DemandeAnalyse::create([
                        'consultation_id' => $consultation->id,
                        'patient_id' => $patient->id,
                        'medecin_id' => $medecin->id,
                        'examens' => [
                            ['nom' => 'NFS (Numération Formule Sanguine)', 'code' => 'NFS', 'urgence' => false],
                            ['nom' => 'CRP', 'code' => 'CRP', 'urgence' => false],
                            ['nom' => 'Glycémie à jeun', 'code' => 'GLY', 'urgence' => true],
                        ],
                        'instructions_laboratoire' => 'Patient à jeun depuis 12h. Résultats urgents souhaités.',
                        'statut' => 'en_attente',
                    ]);
                }
            }
        }
    }
}

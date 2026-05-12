<?php

namespace Database\Seeders;

use App\Models\MedicamentFavori;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Database\Seeder;

class PrescriptionSeeder extends Seeder
{
    public function run(): void
    {
        $medecin = User::where('role', 'medecin')->first()
            ?? User::factory()->create([
                'name' => 'Dr. Sarah Bennani',
                'email' => 'medecin@example.com',
                'role' => 'medecin',
            ]);

        // 10 médicaments favoris
        $favoris = [
            ['Paracétamol', '500mg', '3x/jour', 'à prendre après les repas'],
            ['Amoxicilline', '1g', '2x/jour', 'pendant 7 jours'],
            ['Ibuprofène', '400mg', '3x/jour', 'à prendre avec un verre d\'eau'],
            ['Doliprane', '1000mg', '3x/jour', null],
            ['Spasfon', '80mg', '2x/jour', null],
            ['Ventoline', '100µg', 'au besoin', '2 bouffées en cas de gêne'],
            ['Augmentin', '1g', '2x/jour', 'pendant 6 jours'],
            ['Lévothyrox', '50µg', '1x/jour', 'à jeun le matin'],
            ['Metformine', '500mg', '2x/jour', 'pendant les repas'],
            ['Oméprazole', '20mg', '1x/jour', 'à jeun le matin'],
        ];

        foreach ($favoris as $i => [$nom, $dosage, $freq, $instr]) {
            MedicamentFavori::updateOrCreate(
                ['medecin_id' => $medecin->id, 'nom' => $nom],
                [
                    'dosage_defaut' => $dosage,
                    'frequence_defaut' => $freq,
                    'instructions_defaut' => $instr,
                    'usage_count' => random_int(0, 30),
                ],
            );
        }

        // 5 prescriptions de test
        $patients = Patient::limit(5)->get();
        if ($patients->isEmpty()) {
            return;
        }

        $samples = [
            [
                'diagnostic' => 'Syndrome grippal',
                'lignes' => [
                    ['Paracétamol', '500mg', '3x/jour', '5 jours', 'après les repas'],
                    ['Ibuprofène', '400mg', '2x/jour', '3 jours', null],
                ],
            ],
            [
                'diagnostic' => 'Angine bactérienne',
                'lignes' => [
                    ['Amoxicilline', '1g', '2x/jour', '7 jours', 'pendant les repas'],
                    ['Paracétamol', '1g', '3x/jour', '5 jours', null],
                ],
            ],
            [
                'diagnostic' => 'Hypothyroïdie',
                'lignes' => [
                    ['Lévothyrox', '50µg', '1x/jour', '3 mois', 'à jeun le matin'],
                ],
            ],
            [
                'diagnostic' => 'Reflux gastrique',
                'lignes' => [
                    ['Oméprazole', '20mg', '1x/jour', '1 mois', 'à jeun'],
                    ['Spasfon', '80mg', '2x/jour', '15 jours', 'si douleur'],
                ],
            ],
            [
                'diagnostic' => 'Crise d\'asthme',
                'lignes' => [
                    ['Ventoline', '100µg', 'au besoin', '1 mois', '2 bouffées'],
                ],
            ],
        ];

        foreach ($samples as $i => $sample) {
            $patient = $patients[$i % $patients->count()];

            $p = Prescription::create([
                'patient_id' => $patient->id,
                'medecin_id' => $medecin->id,
                'date_prescription' => now()->subDays($i * 7)->toDateString(),
                'diagnostic' => $sample['diagnostic'],
                'statut' => 'active',
            ]);

            foreach ($sample['lignes'] as $ordre => [$nom, $dosage, $freq, $duree, $instr]) {
                $p->lignes()->create([
                    'medicament_nom' => $nom,
                    'dosage' => $dosage,
                    'frequence' => $freq,
                    'duree' => $duree,
                    'instructions' => $instr,
                    'ordre' => $ordre,
                ]);
            }
        }
    }
}

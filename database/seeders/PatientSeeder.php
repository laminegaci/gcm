<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        // Médecin par défaut s'il n'en existe pas.
        $medecin = User::where('role', 'medecin')->first()
            ?? User::factory()->create([
                'name' => 'Dr. Sarah Bennani',
                'email' => 'medecin@example.com',
                'role' => 'medecin',
            ]);

        $samples = [
            ['Karim', 'El Amrani', 'M', '1985-03-12', 'A+'],
            ['Fatima', 'Benali', 'F', '1992-07-21', 'O-'],
            ['Youssef', 'Tahiri', 'M', '1978-11-04', 'B+'],
            ['Amal', 'Cherkaoui', 'F', '2001-01-30', 'AB+'],
            ['Hassan', 'Idrissi', 'M', '1965-09-15', 'O+'],
            ['Sara', 'Mansouri', 'F', '1995-05-08', 'A-'],
            ['Omar', 'Zerouali', 'M', '1989-12-19', 'B-'],
            ['Leila', 'Berrada', 'F', '1972-04-26', 'AB-'],
            ['Mehdi', 'Kabbaj', 'M', '2005-08-11', 'O+'],
            ['Nour', 'Saidi', 'F', '1988-02-03', 'A+'],
        ];

        foreach ($samples as $i => [$prenom, $nom, $sexe, $dn, $gs]) {
            Patient::create([
                'uuid' => (string) Str::uuid(),
                'cin' => 'CIN'.str_pad((string) ($i + 1), 6, '0', STR_PAD_LEFT),
                'nom' => $nom,
                'prenom' => $prenom,
                'sexe' => $sexe,
                'date_naissance' => Carbon::parse($dn),
                'telephone' => '+2126'.random_int(10_000_000, 99_999_999),
                'email' => Str::lower($prenom.'.'.$nom).'@example.test',
                'groupe_sanguin' => $gs,
                'statut' => $i === 9 ? 'inactif' : 'actif',
                'medecin_id' => $medecin->id,
                'notes' => $i % 3 === 0 ? 'Suivi régulier requis.' : null,
            ])->each(function () {
                // no-op
            });
        }

        // Quelques allergies + contact d'urgence sur les 3 premiers patients.
        Patient::limit(3)->get()->each(function (Patient $p) {
            $p->allergies()->create(['nom' => 'Pénicilline', 'severite' => 'severe']);
            $p->contactsUrgence()->create([
                'nom' => 'Conjoint(e)',
                'telephone' => '+2126'.random_int(10_000_000, 99_999_999),
                'relation' => 'Famille',
            ]);
        });
    }
}

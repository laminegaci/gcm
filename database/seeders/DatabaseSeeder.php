<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RootSeeder::class);

        $this->call(PatientSeeder::class);
        $this->call(PrescriptionSeeder::class);
        $this->call(ConsultationSeeder::class);
    }
}

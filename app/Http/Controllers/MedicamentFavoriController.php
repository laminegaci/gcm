<?php

namespace App\Http\Controllers;

use App\Models\MedicamentFavori;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MedicamentFavoriController extends Controller
{
    public function index(Request $request)
    {
        $favoris = MedicamentFavori::query()
            ->where('medecin_id', $request->user()->id)
            ->orderByDesc('usage_count')
            ->orderBy('nom')
            ->get();

        return response()->json(['data' => $favoris]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:200'],
            'dosage_defaut' => ['nullable', 'string', 'max:100'],
            'frequence_defaut' => ['nullable', 'string', 'max:100'],
            'instructions_defaut' => ['nullable', 'string', 'max:500'],
        ]);

        $data['medecin_id'] = $request->user()->id;

        $fav = MedicamentFavori::updateOrCreate(
            ['medecin_id' => $data['medecin_id'], 'nom' => $data['nom']],
            $data,
        );

        return response()->json(['data' => $fav], 201);
    }

    public function destroy(Request $request, MedicamentFavori $favori)
    {
        abort_unless($favori->medecin_id === $request->user()->id, 403);

        $favori->delete();

        return response()->noContent();
    }
}

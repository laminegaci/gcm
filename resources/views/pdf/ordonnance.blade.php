<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{{ $prescription->numero_ordonnance }}</title>
    <style>
        @page { margin: 12mm 12mm 18mm 12mm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #000; }
        h1, h2, h3 { margin: 0; padding: 0; }
        .header { border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
        .clinique-nom { font-size: 14pt; font-weight: bold; }
        .clinique-meta { font-size: 9pt; }
        .row { width: 100%; display: table; table-layout: fixed; margin-bottom: 8px; }
        .col { display: table-cell; vertical-align: top; }
        .col-medecin { width: 55%; }
        .col-date { width: 45%; text-align: right; }
        .bloc { border: 1px solid #000; padding: 6px 8px; margin-bottom: 8px; }
        .bloc .label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; }
        .patient-line { font-weight: bold; font-size: 11pt; }
        .meds { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .meds th, .meds td { border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: top; }
        .meds th { background: #eee; font-size: 9pt; }
        .meds td.med-name { font-weight: bold; }
        .signature { margin-top: 18px; text-align: right; }
        .signature .box { display: inline-block; width: 6cm; height: 3cm; border: 1px solid #000; }
        .signature .legend { font-size: 8pt; margin-top: 2px; }
        .footer {
            position: fixed; bottom: -6mm; left: 0; right: 0;
            text-align: center; font-size: 8pt; font-style: italic;
            border-top: 1px solid #000; padding-top: 3px;
        }
        .diagnostic { font-size: 9pt; margin-bottom: 6px; }
        .num { font-family: monospace; font-size: 10pt; }
    </style>
</head>
<body>

<div class="header">
    <div class="clinique-nom">{{ $clinique['nom'] }}</div>
    @if(!empty($clinique['adresse']))
        <div class="clinique-meta">{{ $clinique['adresse'] }}</div>
    @endif
    @if(!empty($clinique['telephone']))
        <div class="clinique-meta">Tél. {{ $clinique['telephone'] }}</div>
    @endif
</div>

<div class="row">
    <div class="col col-medecin">
        <div><strong>Dr. {{ $medecin->name }}</strong></div>
        @if(!empty($medecin->specialite))
            <div>{{ $medecin->specialite }}</div>
        @endif
        @if(!empty($medecin->rpps))
            <div>N° RPPS : {{ $medecin->rpps }}</div>
        @endif
    </div>
    <div class="col col-date">
        <div>N° <span class="num">{{ $prescription->numero_ordonnance }}</span></div>
        <div>Le {{ \Carbon\Carbon::parse($prescription->date_prescription)->format('d/m/Y') }}</div>
    </div>
</div>

<div class="bloc">
    <div class="label">Patient</div>
    <div class="patient-line">{{ $patient->prenom }} {{ $patient->nom }}</div>
    <div>
        @if($patient->date_naissance)
            Né(e) le {{ \Carbon\Carbon::parse($patient->date_naissance)->format('d/m/Y') }}
            @if($patient->age) — {{ $patient->age }} ans @endif
        @endif
        @if($patient->sexe)
            — {{ $patient->sexe === 'M' ? 'Homme' : 'Femme' }}
        @endif
    </div>
</div>

@if($prescription->diagnostic)
    <div class="diagnostic"><strong>Diagnostic :</strong> {{ $prescription->diagnostic }}</div>
@endif

<table class="meds">
    <thead>
        <tr>
            <th style="width: 35%;">Médicament</th>
            <th style="width: 15%;">Dosage</th>
            <th style="width: 18%;">Fréquence</th>
            <th style="width: 12%;">Durée</th>
            <th style="width: 20%;">Instructions</th>
        </tr>
    </thead>
    <tbody>
    @foreach($lignes as $l)
        <tr>
            <td class="med-name">{{ $l->medicament_nom }}</td>
            <td>{{ $l->dosage }}</td>
            <td>{{ $l->frequence }}</td>
            <td>{{ $l->duree }}</td>
            <td>{{ $l->instructions }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

@if($prescription->instructions_globales)
    <div style="margin-top: 8px;"><strong>Instructions :</strong> {{ $prescription->instructions_globales }}</div>
@endif

<div class="signature">
    <div class="box"></div>
    <div class="legend">Signature et cachet du médecin</div>
</div>

<div class="footer">
    Ordonnance valable 3 mois — à présenter en pharmacie.
</div>

</body>
</html>

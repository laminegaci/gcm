<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{{ $analyse->numero_demande }}</title>
    <style>
        @page { margin: 12mm 14mm 16mm 14mm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #000; line-height: 1.5; }
        .header { border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
        .clinique-nom { font-size: 14pt; font-weight: bold; }
        .clinique-meta { font-size: 9pt; }
        .row { width: 100%; display: table; table-layout: fixed; margin-bottom: 8px; }
        .col { display: table-cell; vertical-align: top; }
        .col-medecin { width: 55%; }
        .col-right { width: 45%; text-align: right; }
        .bloc { border: 1px solid #000; padding: 6px 8px; margin-bottom: 10px; }
        .bloc .label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; }
        .patient-line { font-weight: bold; font-size: 11pt; }
        .titre { font-size: 13pt; font-weight: bold; text-align: center; margin: 12px 0 10px 0; text-transform: uppercase; }
        .examens { width: 100%; border-collapse: collapse; margin-top: 6px; }
        .examens th, .examens td { border: 1px solid #000; padding: 4px 6px; text-align: left; }
        .examens th { background: #eee; font-size: 9pt; }
        .instructions { margin-top: 10px; padding: 6px 8px; border: 1px solid #000; font-size: 9pt; }
        .instructions strong { font-size: 10pt; }
        .signature { margin-top: 20px; text-align: right; }
        .signature .box { display: inline-block; width: 6cm; height: 3cm; border: 1px solid #000; }
        .signature .legend { font-size: 8pt; margin-top: 2px; }
        .footer { position: fixed; bottom: -4mm; left: 0; right: 0; text-align: center; font-size: 8pt; font-style: italic; border-top: 1px solid #000; padding-top: 3px; }
        .num { font-family: monospace; font-size: 10pt; }
        .urgence { color: #c00; font-weight: bold; }
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
    </div>
    <div class="col col-right">
        <div>N° <span class="num">{{ $analyse->numero_demande }}</span></div>
        <div>Le {{ \Carbon\Carbon::now()->format('d/m/Y') }}</div>
    </div>
</div>

<div class="bloc">
    <div class="label">Patient</div>
    <div class="patient-line">{{ $patient->prenom }} {{ $patient->nom }}</div>
    @if($patient->date_naissance)
        <div>Né(e) le {{ \Carbon\Carbon::parse($patient->date_naissance)->format('d/m/Y') }}
            @if($patient->age) — {{ $patient->age }} ans @endif
        </div>
    @endif
</div>

<div class="titre">Demande d'Analyses</div>

<table class="examens">
    <thead>
        <tr>
            <th style="width: 15%;">Code</th>
            <th style="width: 55%;">Examen</th>
            <th style="width: 30%;">Urgence</th>
        </tr>
    </thead>
    <tbody>
    @foreach($analyse->examens as $examen)
        <tr>
            <td>{{ $examen['code'] ?? '—' }}</td>
            <td>{{ $examen['nom'] }}</td>
            <td class="{{ !empty($examen['urgence']) ? 'urgence' : '' }}">
                {{ !empty($examen['urgence']) ? 'Oui' : 'Non' }}
            </td>
        </tr>
    @endforeach
    </tbody>
</table>

@if(!empty($analyse->instructions_laboratoire))
    <div class="instructions">
        <strong>Instructions pour le laboratoire :</strong><br>
        {{ $analyse->instructions_laboratoire }}
    </div>
@endif

<div style="margin-top: 8px; font-size: 9pt; font-style: italic;">
    @php
        $hasJeun = false;
        foreach($analyse->examens as $ex) {
            if (!empty($ex['urgence']) || stripos($ex['nom'] ?? '', 'glycémie') !== false || stripos($ex['nom'] ?? '', 'glycemie') !== false) {
                $hasJeun = true;
                break;
            }
        }
    @endphp
    @if($hasJeun)
        * À jeun si mentionné
    @endif
</div>

<div class="signature">
    <div class="box"></div>
    <div class="legend">Signature et cachet du médecin</div>
</div>

<div class="footer">
    Document médical confidentiel
</div>

</body>
</html>

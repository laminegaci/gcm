<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{{ $certificat->numero_certificat }}</title>
    <style>
        @page { margin: 12mm 14mm 16mm 14mm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; color: #000; line-height: 1.5; }
        .header { border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 12px; }
        .clinique-nom { font-size: 14pt; font-weight: bold; }
        .clinique-meta { font-size: 9pt; }
        .row { width: 100%; display: table; table-layout: fixed; margin-bottom: 8px; }
        .col { display: table-cell; vertical-align: top; }
        .col-medecin { width: 55%; }
        .col-right { width: 45%; text-align: right; }
        .bloc { border: 1px solid #000; padding: 6px 8px; margin-bottom: 10px; }
        .bloc .label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; }
        .patient-line { font-weight: bold; font-size: 11pt; }
        .titre { font-size: 13pt; font-weight: bold; text-align: center; margin: 14px 0 10px 0; text-transform: uppercase; }
        .corps { text-align: justify; margin-bottom: 14px; }
        .signature { margin-top: 20px; text-align: right; }
        .signature .box { display: inline-block; width: 6cm; height: 3cm; border: 1px solid #000; }
        .signature .legend { font-size: 8pt; margin-top: 2px; }
        .footer { position: fixed; bottom: -4mm; left: 0; right: 0; text-align: center; font-size: 8pt; font-style: italic; border-top: 1px solid #000; padding-top: 3px; }
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
    </div>
    <div class="col col-right">
        <div>N° <span class="num">{{ $certificat->numero_certificat }}</span></div>
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

<div class="titre">Certificat Médical</div>

<div class="corps">
    <p>Je soussigné, <strong>Dr. {{ $medecin->name }}</strong>, certifie avoir examiné ce jour
        <strong>{{ $patient->prenom }} {{ $patient->nom }}</strong>
        @if($patient->date_naissance)
            (né(e) le {{ \Carbon\Carbon::parse($patient->date_naissance)->format('d/m/Y') }})
        @endif
        et constaté ce qui suit :</p>

    <p>{{ $certificat->contenu }}</p>

    @if($certificat->type === 'repos' && $certificat->nombre_jours)
        <p>Cet arrêt de travail est prescrit pour une durée de
            <strong>{{ $certificat->nombre_jours }} jour{{ $certificat->nombre_jours > 1 ? 's' : '' }}</strong>
            à compter du {{ \Carbon\Carbon::parse($certificat->date_debut)->format('d/m/Y') }}.</p>
    @endif
</div>

<div class="signature">
    <div class="box"></div>
    <div class="legend">Signature et cachet du médecin</div>
</div>

<div class="footer">
    Document médical confidentiel — Art. R.4127-4 du Code de la Santé Publique
</div>

</body>
</html>

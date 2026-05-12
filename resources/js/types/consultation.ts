export interface ConstantesVitales {
    id?: number;
    tension_systolique: number | null;
    tension_diastolique: number | null;
    pouls: number | null;
    temperature: number | null;
    poids: number | null;
    taille: number | null;
    spo2: number | null;
    imc?: number | null;
}

export interface Consultation {
    id: number;
    uuid: string;
    patient_id: number;
    medecin_id: number;
    motif: string;
    symptomes: string | null;
    examen_clinique: string | null;
    diagnostic: string | null;
    notes_privees: string | null;
    statut: 'en_cours' | 'terminee' | 'annulee';
    date_consultation: string;
    duree_minutes: number | null;
    patient?: {
        id: number;
        nom: string;
        prenom: string;
        nom_complet: string;
        date_naissance: string;
        age: number;
        photo_url: string | null;
        groupe_sanguin: string | null;
        allergies?: { id: number; nom: string; severite: string }[];
    };
    medecin?: { id: number; name: string };
    constantes?: ConstantesVitales;
    prescriptions?: {
        id: number;
        numero_ordonnance: string;
        statut: string;
        date_prescription: string | null;
    }[];
    certificats?: {
        id: number;
        numero_certificat: string;
        type: string;
        nombre_jours: number | null;
        date_debut: string | null;
    }[];
    demandes_analyses?: {
        id: number;
        numero_demande: string;
        examens: Examen[];
        statut: string;
    }[];
}

export interface Examen {
    nom: string;
    code?: string;
    urgence?: boolean;
}

export interface CertificatForm {
    type: 'repos' | 'aptitude' | 'inaptitude' | 'autre';
    nombre_jours: string;
    date_debut: string;
    contenu: string;
}

export interface AnalyseForm {
    examens: Examen[];
    instructions_laboratoire: string;
}

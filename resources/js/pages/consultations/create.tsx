import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Save, Stethoscope } from 'lucide-react';
import type {FormEvent} from 'react';
import { toast } from 'sonner';

import { PatientMiniCard } from '@/components/patient-mini-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { VitalSignsInput } from '@/components/vital-signs-input';
import type { ConstantesVitales } from '@/types/consultation';

interface PatientLite {
    id: number;
    nom_complet: string;
    nom: string;
    prenom: string;
    date_naissance: string;
    age: number;
    sexe?: string;
    groupe_sanguin: string | null;
    photo_url: string | null;
    allergies?: { id: number; nom: string; severite: string }[];
}

interface LastConsultation {
    date_consultation: string;
    diagnostic: string | null;
}

interface ActivePrescription {
    id: number;
    numero_ordonnance: string;
    lignes: string[];
}

interface Props {
    patient: PatientLite | null;
    lastConsultation: LastConsultation | null;
    activePrescriptions: ActivePrescription[];
}

export default function ConsultationCreate({
    patient,
    lastConsultation,
    activePrescriptions,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: patient?.id ?? 0,
        motif: '',
        symptomes: '',
        examen_clinique: '',
        diagnostic: '',
        notes_privees: '',
        duree_minutes: '',
        tension_systolique: '',
        tension_diastolique: '',
        pouls: '',
        temperature: '',
        poids: '',
        taille: '',
        spo2: '',
    });

    function setConstantes(v: ConstantesVitales) {
        setData({
            ...data,
            tension_systolique: v.tension_systolique?.toString() ?? '',
            tension_diastolique: v.tension_diastolique?.toString() ?? '',
            pouls: v.pouls?.toString() ?? '',
            temperature: v.temperature?.toString() ?? '',
            poids: v.poids?.toString() ?? '',
            taille: v.taille?.toString() ?? '',
            spo2: v.spo2?.toString() ?? '',
        });
    }

    const constantes: ConstantesVitales = {
        tension_systolique: data.tension_systolique
            ? Number(data.tension_systolique)
            : null,
        tension_diastolique: data.tension_diastolique
            ? Number(data.tension_diastolique)
            : null,
        pouls: data.pouls ? Number(data.pouls) : null,
        temperature: data.temperature ? Number(data.temperature) : null,
        poids: data.poids ? Number(data.poids) : null,
        taille: data.taille ? Number(data.taille) : null,
        spo2: data.spo2 ? Number(data.spo2) : null,
    };

    function submit(e: FormEvent, terminer = false) {
        e.preventDefault();

        if (terminer) {
            if (
                !confirm(
                    'Terminer la consultation ? Les modifications ne seront plus possibles.',
                )
            ) {
                return;
            }
        }

        post('/consultations', {
            onSuccess: () => {
                toast.success('Consultation créée.');
            },
        });
    }

    return (
        <>
            <Head title="Nouvelle consultation" />

            <div className="mx-auto max-w-7xl">
                <div className="p-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit('/patients')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Button>
                </div>

                <div className="flex flex-col gap-6 px-6 pb-6 lg:flex-row">
                    {/* Sidebar gauche — infos patient */}
                    <aside className="w-full shrink-0 lg:w-80">
                        <div className="sticky top-6">
                            {patient ? (
                                <PatientMiniCard
                                    patient={patient}
                                    lastConsultation={lastConsultation}
                                    activePrescriptions={activePrescriptions}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="p-6 text-center text-sm text-slate-500">
                                        Sélectionnez un patient pour commencer.
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </aside>

                    {/* Formulaire principal */}
                    <main className="min-w-0 flex-1 space-y-6">
                        <form onSubmit={(e) => submit(e)} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Stethoscope className="h-5 w-5 text-ocean-teal" />
                                        Section A — Constantes vitales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <VitalSignsInput
                                        values={constantes}
                                        onChange={setConstantes}
                                        errors={errors}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Stethoscope className="h-5 w-5 text-ocean-teal" />
                                        Section B — Motif + Clinique
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Motif *</Label>
                                        <Input
                                            value={data.motif}
                                            onChange={(e) =>
                                                setData('motif', e.target.value)
                                            }
                                            placeholder="Motif de la consultation"
                                        />
                                        {errors.motif && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.motif}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Symptômes</Label>
                                        <Textarea
                                            value={data.symptomes}
                                            onChange={(e) =>
                                                setData(
                                                    'symptomes',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="Description des symptômes..."
                                        />
                                    </div>
                                    <div>
                                        <Label>Examen clinique</Label>
                                        <Textarea
                                            value={data.examen_clinique}
                                            onChange={(e) =>
                                                setData(
                                                    'examen_clinique',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="Résultats de l'examen clinique..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Section C — Diagnostic + Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Diagnostic</Label>
                                        <Textarea
                                            value={data.diagnostic}
                                            onChange={(e) =>
                                                setData(
                                                    'diagnostic',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="Diagnostic..."
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-amber-600">
                                            Notes privées (visible médecin
                                            uniquement)
                                        </Label>
                                        <Textarea
                                            value={data.notes_privees}
                                            onChange={(e) =>
                                                setData(
                                                    'notes_privees',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="Notes personnelles..."
                                        />
                                    </div>
                                    <div>
                                        <Label>Durée (minutes)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={data.duree_minutes}
                                            onChange={(e) =>
                                                setData(
                                                    'duree_minutes',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="ex: 30"
                                            className="w-32"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Section D — Actions rapides
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3 text-sm text-slate-500">
                                        Ces actions seront disponibles après la
                                        création de la consultation.
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Utilisez les boutons dans la page de
                                        détail après création.
                                    </p>
                                </CardContent>
                            </Card>

                            <Separator />

                            <div className="flex flex-wrap justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/patients')}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={processing}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Enregistrer brouillon
                                </Button>
                                <Button
                                    type="button"
                                    disabled={processing || !patient}
                                    className="bg-ocean-deep text-white hover:bg-ocean-deep/90"
                                    onClick={(e) =>
                                        submit(e as unknown as FormEvent, true)
                                    }
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Terminer la consultation
                                </Button>
                            </div>
                        </form>
                    </main>
                </div>
            </div>
        </>
    );
}

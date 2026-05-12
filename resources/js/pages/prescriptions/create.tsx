import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Star } from 'lucide-react';
import { type FormEvent } from 'react';
import { toast } from 'sonner';

import { Ligne, PrescriptionLigneRow } from '@/components/prescription-ligne-row';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Favori {
    id: number;
    nom: string;
    dosage_defaut: string | null;
    frequence_defaut: string | null;
    instructions_defaut: string | null;
    usage_count: number;
}

interface PatientLite {
    id: number;
    nom: string;
    prenom: string;
}

interface PrescriptionResource {
    data: {
        id: number;
        patient_id: number;
        date_prescription: string | null;
        date_expiration: string | null;
        diagnostic: string | null;
        instructions_globales: string | null;
        statut: 'active' | 'expiree' | 'annulee';
        lignes: Ligne[];
    };
}

interface Props {
    prescription?: PrescriptionResource;
    patient: { id: number; nom_complet: string } | null;
    patients: PatientLite[];
    favoris: Favori[];
}

function emptyLigne(): Ligne {
    return { medicament_nom: '', dosage: '', frequence: '', duree: '', instructions: '' };
}

export default function PrescriptionCreate({ prescription, patient, patients, favoris }: Props) {
    const isEdit = !!prescription;
    const initial = prescription?.data;

    const { data, setData, post, put, processing, errors } = useForm({
        patient_id: initial?.patient_id ?? patient?.id ?? 0,
        date_prescription: initial?.date_prescription ?? new Date().toISOString().slice(0, 10),
        date_expiration: initial?.date_expiration ?? '',
        diagnostic: initial?.diagnostic ?? '',
        instructions_globales: initial?.instructions_globales ?? '',
        statut: initial?.statut ?? 'active',
        lignes: (initial?.lignes && initial.lignes.length > 0
            ? initial.lignes.map((l) => ({ ...l }))
            : [emptyLigne()]) as Ligne[],
    });

    function addLigne() {
        setData('lignes', [...data.lignes, emptyLigne()]);
    }

    function addFromFavori(f: Favori) {
        setData('lignes', [
            ...data.lignes,
            {
                medicament_nom: f.nom,
                dosage: f.dosage_defaut ?? '',
                frequence: f.frequence_defaut ?? '',
                duree: '',
                instructions: f.instructions_defaut ?? '',
            },
        ]);
    }

    function updateLigne(idx: number, next: Ligne) {
        const copy = [...data.lignes];
        copy[idx] = next;
        setData('lignes', copy);
    }

    function deleteLigne(idx: number) {
        if (data.lignes.length === 1) {
            toast.error('Au moins un médicament est requis.');
            return;
        }
        setData('lignes', data.lignes.filter((_, i) => i !== idx));
    }

    function submit(e: FormEvent, andPrint = false) {
        e.preventDefault();

        const onSuccess = (page: { props: { prescription?: PrescriptionResource } }) => {
            toast.success(isEdit ? 'Ordonnance mise à jour.' : 'Ordonnance créée.');
            if (andPrint && page?.props?.prescription) {
                window.open(`/prescriptions/${page.props.prescription.data.id}/pdf`, '_blank');
            }
        };

        if (isEdit) {
            put(`/prescriptions/${initial!.id}`, { onSuccess });
        } else {
            post('/prescriptions', { onSuccess });
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Modifier ordonnance' : 'Nouvelle ordonnance'} />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <Button variant="ghost" size="sm" onClick={() => router.visit('/prescriptions')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>

                <form onSubmit={(e) => submit(e, false)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{isEdit ? 'Modifier ordonnance' : 'Nouvelle ordonnance'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Patient *</Label>
                                    <Select
                                        value={data.patient_id ? String(data.patient_id) : ''}
                                        onValueChange={(v) => setData('patient_id', Number(v))}
                                        disabled={isEdit}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.prenom} {p.nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && (
                                        <p className="mt-1 text-xs text-red-600">{errors.patient_id}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Date prescription</Label>
                                    <Input
                                        type="date"
                                        value={data.date_prescription}
                                        onChange={(e) => setData('date_prescription', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Diagnostic</Label>
                                <Input
                                    value={data.diagnostic}
                                    onChange={(e) => setData('diagnostic', e.target.value)}
                                    placeholder="Diagnostic (facultatif)"
                                />
                            </div>

                            <div>
                                <Label>Instructions globales</Label>
                                <Input
                                    value={data.instructions_globales}
                                    onChange={(e) => setData('instructions_globales', e.target.value)}
                                    placeholder="Recommandations générales (facultatif)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle>Médicaments</CardTitle>
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button type="button" variant="outline" size="sm" disabled={favoris.length === 0}>
                                            <Star className="mr-2 h-4 w-4" />
                                            Depuis favoris
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="max-h-80 overflow-auto">
                                        <DropdownMenuLabel>Favoris (les plus utilisés)</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {favoris.map((f) => (
                                            <DropdownMenuItem key={f.id} onSelect={() => addFromFavori(f)}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{f.nom}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {f.dosage_defaut} {f.frequence_defaut && `· ${f.frequence_defaut}`}
                                                    </span>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button type="button" variant="outline" size="sm" onClick={addLigne}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.lignes.map((ligne, i) => (
                                <PrescriptionLigneRow
                                    key={i}
                                    ligne={ligne}
                                    index={i}
                                    onChange={(next) => updateLigne(i, next)}
                                    onDelete={() => deleteLigne(i)}
                                    favoris={favoris}
                                    errors={{
                                        medicament_nom: errors[`lignes.${i}.medicament_nom` as keyof typeof errors],
                                        dosage: errors[`lignes.${i}.dosage` as keyof typeof errors],
                                    }}
                                />
                            ))}
                            {errors.lignes && (
                                <p className="text-sm text-red-600">{errors.lignes}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => submit(e as unknown as FormEvent, true)}
                            disabled={processing}
                        >
                            Enregistrer et imprimer
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-ocean-deep hover:bg-ocean-deep/90 text-white"
                        >
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

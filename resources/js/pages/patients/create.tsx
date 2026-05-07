import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Medecin {
    id: number;
    name: string;
}

interface Props {
    medecins: Medecin[];
}

const GROUPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export default function CreatePatient({ medecins }: Props) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        nom: string;
        prenom: string;
        sexe: 'M' | 'F' | '';
        date_naissance: string;
        cin: string;
        telephone: string;
        email: string;
        groupe_sanguin: string;
        medecin_id: string;
        notes: string;
        photo: File | null;
    }>({
        nom: '',
        prenom: '',
        sexe: '',
        date_naissance: '',
        cin: '',
        telephone: '',
        email: '',
        groupe_sanguin: '',
        medecin_id: '',
        notes: '',
        photo: null,
    });

    const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('photo', file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/patients', {
            forceFormData: true,
            onError: () => toast.error('Veuillez corriger les erreurs du formulaire.'),
            onSuccess: () => {
                toast.success('Patient créé.');
                reset();
                setPhotoPreview(null);
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Patients', href: '/patients' },
                { title: 'Nouveau', href: '/patients/create' },
            ]}
        >
            <Head title="Nouveau patient" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Button asChild variant="ghost" size="sm">
                    <a href="/patients">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </a>
                </Button>

                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Nouveau patient</h1>
                    <p className="text-sm text-slate-500">Renseignez les informations administratives de base.</p>
                </div>

                <form onSubmit={submit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6">
                    {/* Photo */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Aperçu" className="h-full w-full object-cover" />
                            ) : (
                                <Upload className="h-6 w-6 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={onPhotoChange}
                                className="hidden"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                                Choisir une photo
                            </Button>
                            {errors.photo && <p className="mt-1 text-xs text-red-600">{errors.photo}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Nom" error={errors.nom} required>
                            <Input value={data.nom} onChange={(e) => setData('nom', e.target.value)} />
                        </Field>
                        <Field label="Prénom" error={errors.prenom} required>
                            <Input value={data.prenom} onChange={(e) => setData('prenom', e.target.value)} />
                        </Field>

                        <Field label="Sexe" error={errors.sexe} required>
                            <Select value={data.sexe} onValueChange={(v) => setData('sexe', v as 'M' | 'F')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Masculin</SelectItem>
                                    <SelectItem value="F">Féminin</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Date de naissance" error={errors.date_naissance} required>
                            <Input
                                type="date"
                                value={data.date_naissance}
                                onChange={(e) => setData('date_naissance', e.target.value)}
                            />
                        </Field>

                        <Field label="CIN" error={errors.cin}>
                            <Input value={data.cin} onChange={(e) => setData('cin', e.target.value)} />
                        </Field>
                        <Field label="Téléphone" error={errors.telephone}>
                            <Input value={data.telephone} onChange={(e) => setData('telephone', e.target.value)} />
                        </Field>

                        <Field label="Email" error={errors.email}>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </Field>
                        <Field label="Groupe sanguin" error={errors.groupe_sanguin}>
                            <Select
                                value={data.groupe_sanguin}
                                onValueChange={(v) => setData('groupe_sanguin', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GROUPES.map((g) => (
                                        <SelectItem key={g} value={g}>
                                            {g}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="Médecin référent" error={errors.medecin_id} className="md:col-span-2">
                            <Select
                                value={data.medecin_id}
                                onValueChange={(v) => setData('medecin_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Aucun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {medecins.map((m) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field label="Notes" error={errors.notes} className="md:col-span-2">
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </Field>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <Button type="button" variant="ghost" asChild>
                            <a href="/patients">Annuler</a>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Enregistrement…' : 'Créer le patient'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

function Field({
    label,
    error,
    required,
    children,
    className,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <Label className="text-sm">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

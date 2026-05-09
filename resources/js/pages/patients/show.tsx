import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { type FormEvent } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Allergie {
    id: number;
    nom: string;
    severite: 'legere' | 'moderee' | 'severe';
}

interface ContactUrgence {
    id: number;
    nom: string;
    telephone: string;
    relation: string | null;
}

interface Patient {
    id: number;
    dossier_number: string;
    nom: string;
    prenom: string;
    nom_complet: string;
    sexe: 'M' | 'F';
    date_naissance: string;
    age: number;
    cin: string | null;
    telephone: string | null;
    email: string | null;
    groupe_sanguin: string | null;
    photo_url: string | null;
    statut: 'actif' | 'inactif';
    notes: string | null;
    contacts_urgence: ContactUrgence[];
    allergies: Allergie[];
}

interface Props {
    patient: { data: Patient };
}

const SEVERITY_STYLES: Record<Allergie['severite'], string> = {
    legere: 'bg-amber-100 text-amber-700',
    moderee: 'bg-orange-100 text-orange-700',
    severe: 'bg-red-100 text-red-700',
};

export default function PatientShow({ patient }: Props) {
    const p = patient.data;
    const contact = p.contacts_urgence?.[0];

    return (
        <>
        <Head title={p.nom_complet} />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/patients">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Link>
                </Button>

                {/* Carte infos personnelles */}
                <Card>
                    <CardContent className="flex flex-wrap items-start gap-6 p-6">
                        <Avatar className="h-20 w-20">
                            {p.photo_url && <AvatarImage src={p.photo_url} alt={p.nom_complet} />}
                            <AvatarFallback className="bg-blue-100 text-lg text-blue-700">
                                {(p.prenom[0] + p.nom[0]).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold text-slate-900">{p.nom_complet}</h1>
                                <Badge
                                    className={cn(
                                        p.statut === 'actif'
                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-200',
                                    )}
                                >
                                    {p.statut}
                                </Badge>
                            </div>
                            <p className="font-mono text-xs text-slate-500">{p.dossier_number}</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 text-sm text-slate-600 sm:grid-cols-4">
                                <Info label="Sexe" value={p.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                                <Info label="Âge" value={`${p.age} ans`} />
                                <Info label="Groupe sanguin" value={p.groupe_sanguin ?? '—'} />
                                <Info label="CIN" value={p.cin ?? '—'} />
                                <Info label="Téléphone" value={p.telephone ?? '—'} />
                                <Info label="Email" value={p.email ?? '—'} />
                                <Info label="Naissance" value={p.date_naissance} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <AllergiesSection patientId={p.id} allergies={p.allergies ?? []} />
                    <ContactUrgenceSection patientId={p.id} contact={contact} />
                </div>

                {/* Liste consultations — placeholder MVP */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Consultations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="py-8 text-center text-sm text-slate-500">
                            Aucune consultation enregistrée pour ce patient.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-sm text-slate-700">{value}</p>
        </div>
    );
}

function AllergiesSection({ patientId, allergies }: { patientId: number; allergies: Allergie[] }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        nom: '',
        severite: 'moderee' as Allergie['severite'],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/patients/${patientId}/allergies`, {
            preserveScroll: true,
            onSuccess: () => {
                reset('nom');
                toast.success('Allergie ajoutée.');
            },
        });
    };

    const remove = (id: number) => {
        router.delete(`/patients/${patientId}/allergies/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Allergie supprimée.'),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Allergies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <ul className="space-y-2">
                    {allergies.length === 0 && (
                        <li className="text-sm text-slate-500">Aucune allergie connue.</li>
                    )}
                    {allergies.map((a) => (
                        <li
                            key={a.id}
                            className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-800">{a.nom}</span>
                                <Badge className={cn(SEVERITY_STYLES[a.severite], 'hover:bg-current/10')}>
                                    {a.severite}
                                </Badge>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => remove(a.id)}
                                aria-label="Supprimer"
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </li>
                    ))}
                </ul>

                <Separator />

                <form onSubmit={submit} className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nom de l'allergie"
                            value={data.nom}
                            onChange={(e) => setData('nom', e.target.value)}
                        />
                        <Select
                            value={data.severite}
                            onValueChange={(v) => setData('severite', v as Allergie['severite'])}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="legere">Légère</SelectItem>
                                <SelectItem value="moderee">Modérée</SelectItem>
                                <SelectItem value="severe">Sévère</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" size="icon" disabled={processing} aria-label="Ajouter">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {errors.nom && <p className="text-xs text-red-600">{errors.nom}</p>}
                </form>
            </CardContent>
        </Card>
    );
}

function ContactUrgenceSection({
    patientId,
    contact,
}: {
    patientId: number;
    contact?: ContactUrgence;
}) {
    const { data, setData, post, processing, errors } = useForm({
        nom: contact?.nom ?? '',
        telephone: contact?.telephone ?? '',
        relation: contact?.relation ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/patients/${patientId}/contact-urgence`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Contact d’urgence enregistré.'),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Contact d’urgence</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-3">
                    <div className="space-y-1.5">
                        <Label className="text-sm">Nom</Label>
                        <Input value={data.nom} onChange={(e) => setData('nom', e.target.value)} />
                        {errors.nom && <p className="text-xs text-red-600">{errors.nom}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm">Téléphone</Label>
                        <Input
                            value={data.telephone}
                            onChange={(e) => setData('telephone', e.target.value)}
                        />
                        {errors.telephone && <p className="text-xs text-red-600">{errors.telephone}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm">Relation</Label>
                        <Input
                            placeholder="ex. Conjoint(e), parent..."
                            value={data.relation}
                            onChange={(e) => setData('relation', e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={processing} className="w-full">
                        Enregistrer
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

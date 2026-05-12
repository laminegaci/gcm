import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Copy, Pencil, Printer, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Ligne {
    id: number;
    medicament_nom: string;
    dosage: string;
    frequence: string | null;
    duree: string | null;
    instructions: string | null;
}

interface Prescription {
    id: number;
    numero_ordonnance: string;
    date_prescription: string;
    date_expiration: string | null;
    diagnostic: string | null;
    instructions_globales: string | null;
    statut: 'active' | 'expiree' | 'annulee';
    medecin_id: number;
    patient: {
        id: number;
        nom_complet: string;
        date_naissance: string | null;
        age: number | null;
    };
    medecin: { id: number; name: string };
    lignes: Ligne[];
}

interface Props {
    prescription: { data: Prescription };
}

interface SharedPageProps {
    auth: { user: { id: number; role: string } | null };
    [key: string]: unknown;
}

const STATUT_LABELS = { active: 'Active', expiree: 'Expirée', annulee: 'Annulée' } as const;
const STATUT_STYLES = {
    active: 'bg-emerald-100 text-emerald-700',
    expiree: 'bg-slate-200 text-slate-600',
    annulee: 'bg-red-100 text-red-700',
} as const;

function formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
}

export default function PrescriptionShow({ prescription }: Props) {
    const p = prescription.data;
    const { auth } = usePage<SharedPageProps>().props;
    const canEdit = !!auth?.user && (auth.user.role === 'admin' || auth.user.id === p.medecin_id);

    function handleDelete() {
        if (!confirm('Supprimer cette ordonnance ?')) return;
        router.delete(`/prescriptions/${p.id}`);
    }

    function handleDuplicate() {
        router.post(
            `/prescriptions/${p.id}/duplicate`,
            {},
            {
                onSuccess: () => toast.success('Ordonnance dupliquée.'),
            },
        );
    }

    return (
        <>
            <Head title={p.numero_ordonnance} />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/prescriptions">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <a href={`/prescriptions/${p.id}/pdf`} target="_blank" rel="noopener">
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimer
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDuplicate}>
                            <Copy className="mr-2 h-4 w-4" />
                            Dupliquer
                        </Button>
                        {canEdit && (
                            <>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/prescriptions/${p.id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Modifier
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle className="font-mono text-lg">{p.numero_ordonnance}</CardTitle>
                                <p className="text-sm text-slate-500">
                                    {formatDate(p.date_prescription)} — Dr. {p.medecin.name}
                                </p>
                            </div>
                            <Badge className={cn('text-sm', STATUT_STYLES[p.statut])}>
                                {STATUT_LABELS[p.statut]}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Patient</Label>
                                <p className="font-medium">{p.patient.nom_complet}</p>
                                {p.patient.age != null && (
                                    <p className="text-sm text-slate-500">{p.patient.age} ans</p>
                                )}
                            </div>
                            <div>
                                <Label>Expire le</Label>
                                <p>{formatDate(p.date_expiration)}</p>
                            </div>
                        </div>

                        {p.diagnostic && (
                            <div>
                                <Label>Diagnostic</Label>
                                <p className="text-slate-700">{p.diagnostic}</p>
                            </div>
                        )}

                        {p.instructions_globales && (
                            <div>
                                <Label>Instructions globales</Label>
                                <p className="text-slate-700">{p.instructions_globales}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Médicaments ({p.lignes.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-ocean-sand/60 text-left text-xs uppercase text-ocean-deep/60">
                                    <tr>
                                        <th className="px-3 py-2">Médicament</th>
                                        <th className="px-3 py-2">Dosage</th>
                                        <th className="px-3 py-2">Fréquence</th>
                                        <th className="px-3 py-2">Durée</th>
                                        <th className="px-3 py-2">Instructions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ocean-aqua/20">
                                    {p.lignes.map((l) => (
                                        <tr key={l.id}>
                                            <td className="px-3 py-2 font-medium">{l.medicament_nom}</td>
                                            <td className="px-3 py-2">{l.dosage}</td>
                                            <td className="px-3 py-2">{l.frequence ?? '—'}</td>
                                            <td className="px-3 py-2">{l.duree ?? '—'}</td>
                                            <td className="px-3 py-2 text-slate-600">{l.instructions ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{children}</p>
    );
}

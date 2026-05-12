import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus, Printer, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Prescription {
    id: number;
    numero_ordonnance: string;
    date_prescription: string;
    date_expiration: string | null;
    statut: 'active' | 'expiree' | 'annulee';
    lignes_count: number;
    patient: { id: number; nom_complet: string } | null;
    medecin: { id: number; name: string } | null;
}

interface Paginated {
    data: Prescription[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

interface Props {
    prescriptions: Paginated;
    filters: { patient_id?: number; statut?: string; date?: string };
    patient: { id: number; nom_complet: string } | null;
}

const STATUT_LABELS: Record<Prescription['statut'], string> = {
    active: 'Active',
    expiree: 'Expirée',
    annulee: 'Annulée',
};

const STATUT_STYLES: Record<Prescription['statut'], string> = {
    active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20',
    expiree: 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/30',
    annulee: 'bg-red-100 text-red-700 ring-1 ring-red-600/20',
};

function formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
}

export default function PrescriptionsIndex({ prescriptions, patient }: Props) {
    function handleDelete(id: number) {
        if (!confirm('Supprimer cette ordonnance ?')) return;
        router.delete(`/prescriptions/${id}`, { preserveScroll: true });
    }

    const newHref = patient
        ? `/prescriptions/create?patient_id=${patient.id}`
        : '/prescriptions/create';

    return (
        <>
            <Head title="Ordonnances" />

            <div className="space-y-5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-ocean-deep dark:text-sidebar-foreground">
                            Ordonnances{patient ? ` — ${patient.nom_complet}` : ''}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-sidebar-foreground/60">
                            {prescriptions.meta.total} ordonnance{prescriptions.meta.total > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild className="bg-ocean-deep hover:bg-ocean-deep/90 text-white">
                        <Link href={newHref}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle ordonnance
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-ocean-aqua/30 bg-white shadow-sm dark:bg-card dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-ocean-sand/60 text-left text-xs uppercase text-ocean-deep/60 dark:bg-sidebar-accent dark:text-sidebar-foreground/60">
                                <tr>
                                    <th className="px-4 py-3.5 font-medium">N° Ordonnance</th>
                                    {!patient && <th className="px-4 py-3.5 font-medium">Patient</th>}
                                    <th className="px-4 py-3.5 font-medium">Date</th>
                                    <th className="px-4 py-3.5 font-medium">Médicaments</th>
                                    <th className="px-4 py-3.5 font-medium">Statut</th>
                                    <th className="px-4 py-3.5 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ocean-aqua/20 dark:divide-sidebar-border">
                                {prescriptions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={patient ? 5 : 6} className="px-4 py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-8 w-8 text-ocean-aqua/60" />
                                                <p className="text-base font-medium text-ocean-deep/40 dark:text-sidebar-foreground/50">
                                                    Aucune ordonnance
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {prescriptions.data.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="transition-colors hover:bg-ocean-aqua/20 dark:hover:bg-sidebar-accent"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/prescriptions/${p.id}`}
                                                className="font-mono text-xs font-medium text-ocean-deep hover:text-ocean-teal dark:text-sidebar-foreground"
                                            >
                                                {p.numero_ordonnance}
                                            </Link>
                                        </td>
                                        {!patient && (
                                            <td className="px-4 py-3 text-slate-700 dark:text-sidebar-foreground/80">
                                                {p.patient?.nom_complet ?? '—'}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-slate-600 dark:text-sidebar-foreground/70">
                                            {formatDate(p.date_prescription)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-sidebar-foreground/70">
                                            {p.lignes_count} médicament{p.lignes_count > 1 ? 's' : ''}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    STATUT_STYLES[p.statut],
                                                )}
                                            >
                                                {STATUT_LABELS[p.statut]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="sm">
                                                    <a
                                                        href={`/prescriptions/${p.id}/pdf`}
                                                        target="_blank"
                                                        rel="noopener"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={`/prescriptions/${p.id}`}>Voir</Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(p.id)}
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {prescriptions.meta.links && prescriptions.meta.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="text-sm text-slate-500 dark:text-sidebar-foreground/60">
                            Page {prescriptions.meta.current_page} sur {prescriptions.meta.last_page}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {prescriptions.meta.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.visit(link.url, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        })
                                    }
                                    className={cn(
                                        'min-w-9 rounded-lg border px-3 py-1.5 text-sm transition-all',
                                        link.active
                                            ? 'border-ocean-teal bg-ocean-deep text-white'
                                            : 'border-ocean-aqua/40 bg-white text-ocean-deep/70 hover:border-ocean-teal/50',
                                        !link.url && 'cursor-not-allowed opacity-40',
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Patient {
    id: number;
    dossier_number: string;
    nom_complet: string;
    nom: string;
    prenom: string;
    telephone: string | null;
    age: number | null;
    statut: 'actif' | 'inactif';
    photo_url: string | null;
}

interface PaginatedPatients {
    data: Patient[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

interface Props {
    patients: PaginatedPatients;
    filters: { search?: string; sexe?: string; statut?: string; medecin_id?: number };
}

function getInitials(nom: string, prenom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase() || '?';
}

export default function PatientsIndex({ patients, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    // Debounce 300ms : partial reload Inertia (ne recharge que `patients` + `filters`)
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search === (filters.search ?? '')) return;
            router.get(
                '/patients',
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true, only: ['patients', 'filters'] },
            );
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, filters.search]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Patients', href: '/patients' }]}>
            <Head title="Patients" />

            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
                        <p className="text-sm text-slate-500">
                            {patients.meta.total} dossier{patients.meta.total > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/patients/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau patient
                        </Link>
                    </Button>
                </div>

                <div className="relative max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par nom, téléphone, dossier, CIN..."
                        className="pl-9"
                        aria-label="Rechercher un patient"
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Patient</th>
                                <th className="px-4 py-3 font-medium">Dossier</th>
                                <th className="px-4 py-3 font-medium">Téléphone</th>
                                <th className="px-4 py-3 font-medium">Âge</th>
                                <th className="px-4 py-3 font-medium">Statut</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {patients.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        Aucun patient trouvé.
                                    </td>
                                </tr>
                            )}
                            {patients.data.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                {p.photo_url && <AvatarImage src={p.photo_url} alt={p.nom_complet} />}
                                                <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                                                    {getInitials(p.nom, p.prenom)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-slate-900">{p.nom_complet}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.dossier_number}</td>
                                    <td className="px-4 py-3 text-slate-600">{p.telephone ?? '—'}</td>
                                    <td className="px-4 py-3 text-slate-600">{p.age ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            className={cn(
                                                p.statut === 'actif'
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-200',
                                            )}
                                        >
                                            {p.statut}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/patients/${p.id}`}>Voir</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {patients.meta.links && patients.meta.links.length > 3 && (
                    <div className="flex flex-wrap gap-1">
                        {patients.meta.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url &&
                                    router.visit(link.url, { preserveState: true, preserveScroll: true })
                                }
                                className={cn(
                                    'min-w-9 rounded border px-3 py-1.5 text-sm transition-colors',
                                    link.active
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                    !link.url && 'opacity-40',
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

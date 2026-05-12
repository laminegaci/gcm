import { Head, Link, router } from '@inertiajs/react';
import { Columns3, Download, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Patient {
    id: number;
    dossier_number: string;
    nom_complet: string;
    nom: string;
    prenom: string;
    cin: string | null;
    sexe: string | null;
    telephone: string | null;
    age: number | null;
    statut: 'actif' | 'inactif';
    photo_url: string | null;
    medecin: { id: number; name: string } | null;
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

interface Medecin {
    id: number;
    name: string;
}

interface Props {
    patients: PaginatedPatients;
    filters: {
        search?: string;
        sexe?: string;
        statut?: string;
        medecin_id?: number;
    };
    medecins: Medecin[];
}

type ColumnKey =
    | 'patient'
    | 'dossier'
    | 'telephone'
    | 'sexe'
    | 'age'
    | 'statut'
    | 'medecin';

interface ColumnDef {
    key: ColumnKey;
    label: string;
    always?: boolean;
}

const ALL_COLUMNS: ColumnDef[] = [
    { key: 'patient', label: 'Patient', always: true },
    { key: 'dossier', label: 'Dossier' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'sexe', label: 'Sexe' },
    { key: 'age', label: 'Âge' },
    { key: 'statut', label: 'Statut' },
    { key: 'medecin', label: 'Médecin traitant' },
];

const STORAGE_KEY = 'patients_visible_columns';

function getInitialVisibleColumns(): Set<ColumnKey> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored) as ColumnKey[];

            return new Set(parsed);
        }
    } catch {
        /* ignore */
    }

    return new Set(ALL_COLUMNS.map((c) => c.key));
}

function getInitials(nom: string, prenom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase() || '?';
}

function exportToCsv(
    patients: Patient[],
    visibleColumns: Set<ColumnKey>,
): void {
    const labels: Record<ColumnKey, string> = {
        patient: 'Patient',
        dossier: 'N° Dossier',
        telephone: 'Téléphone',
        sexe: 'Sexe',
        age: 'Âge',
        statut: 'Statut',
        medecin: 'Médecin traitant',
    };

    const headers = ALL_COLUMNS.filter((c) => visibleColumns.has(c.key)).map(
        (c) => labels[c.key],
    );
    const rows = patients.map((p) => {
        const row: string[] = [];

        for (const col of ALL_COLUMNS) {
            if (!visibleColumns.has(col.key)) {
                continue;
            }

            switch (col.key) {
                case 'patient':
                    row.push(p.nom_complet);
                    break;
                case 'dossier':
                    row.push(p.dossier_number);
                    break;
                case 'telephone':
                    row.push(p.telephone ?? '');
                    break;
                case 'sexe':
                    row.push(p.sexe ?? '');
                    break;
                case 'age':
                    row.push(p.age?.toString() ?? '');
                    break;
                case 'statut':
                    row.push(p.statut);
                    break;
                case 'medecin':
                    row.push(p.medecin?.name ?? '');
                    break;
            }
        }

        return row;
    });

    const csvContent = [
        headers.map(escapeCsvField).join(','),
        ...rows.map((r) => r.map(escapeCsvField).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
        type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
}

function getSexeIcon(sexe: string | null): string {
    if (sexe === 'homme') {
        return '\u2642';
    }

    if (sexe === 'femme') {
        return '\u2640';
    }

    return '';
}

export default function PatientsIndex({ patients, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
        getInitialVisibleColumns,
    );
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...visibleColumns]));
    }, [visibleColumns]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search === (filters.search ?? '')) {
                return;
            }

            router.get(
                '/patients',
                { search: search || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['patients', 'filters'],
                },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search]);

    function handleRefresh() {
        setRefreshing(true);
        router.reload({
            preserveState: false,
            preserveScroll: true,
            onFinish: () => setRefreshing(false),
        });
        toast.success('Liste actualisée');
    }

    function handleExport() {
        exportToCsv(patients.data, visibleColumns);
        toast.success(`${patients.data.length} patient(s) exporté(s)`);
    }

    function toggleColumn(key: ColumnKey) {
        setVisibleColumns((prev) => {
            const next = new Set(prev);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }

    const colSpan =
        ALL_COLUMNS.filter((c) => visibleColumns.has(c.key)).length + 1;

    return (
        <>
            <Head title="Patients" />

            <div className="space-y-5 p-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-ocean-deep dark:text-sidebar-foreground">
                            Patients
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-sidebar-foreground/60">
                            {patients.meta.total} dossier
                            {patients.meta.total > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button
                        asChild
                        className="bg-ocean-deep text-white shadow-sm shadow-ocean-deep/20 hover:bg-ocean-deep/90"
                    >
                        <Link href="/patients/create">
                            <svg
                                className="mr-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                            Nouveau patient
                        </Link>
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative max-w-md flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ocean-teal/50" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par nom, téléphone, dossier, CIN..."
                            className="border-ocean-aqua/60 pl-9 focus:border-ocean-teal focus:ring-2 focus:ring-ocean-teal/20"
                            aria-label="Rechercher un patient"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Refresh */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    aria-label="Actualiser"
                                >
                                    <RefreshCw
                                        className={cn(
                                            'h-4 w-4',
                                            refreshing && 'animate-spin',
                                        )}
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Actualiser la liste</TooltipContent>
                        </Tooltip>

                        {/* Columns */}
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            aria-label="Colonnes"
                                        >
                                            <Columns3 className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Afficher / masquer les colonnes
                                </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Colonnes</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {ALL_COLUMNS.map((col) => (
                                    <DropdownMenuCheckboxItem
                                        key={col.key}
                                        checked={visibleColumns.has(col.key)}
                                        onCheckedChange={() =>
                                            toggleColumn(col.key)
                                        }
                                        disabled={col.always}
                                    >
                                        {col.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Export */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={handleExport}
                                    aria-label="Exporter"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Exporter
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Exporter en CSV</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-ocean-aqua/30 bg-white shadow-sm dark:border-sidebar-border dark:bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-ocean-sand/60 text-left text-xs text-ocean-deep/60 uppercase dark:bg-sidebar-accent dark:text-sidebar-foreground/60">
                                <tr>
                                    {ALL_COLUMNS.map(
                                        (col) =>
                                            visibleColumns.has(col.key) && (
                                                <th
                                                    key={col.key}
                                                    className="px-4 py-3.5 font-medium"
                                                >
                                                    {col.label}
                                                </th>
                                            ),
                                    )}
                                    <th className="px-4 py-3.5 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ocean-aqua/20 dark:divide-sidebar-border">
                                {patients.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={colSpan}
                                            className="px-4 py-16 text-center text-slate-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="h-8 w-8 text-ocean-aqua/60" />
                                                <p className="text-base font-medium text-ocean-deep/40 dark:text-sidebar-foreground/50">
                                                    Aucun patient trouvé
                                                </p>
                                                <p className="text-sm text-ocean-deep/30 dark:text-sidebar-foreground/40">
                                                    Essayez de modifier votre
                                                    recherche
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {patients.data.map((p) => (
                                    <tr
                                        key={p.id}
                                        className="transition-colors hover:bg-ocean-aqua/20 dark:hover:bg-sidebar-accent"
                                    >
                                        {visibleColumns.has('patient') && (
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/patients/${p.id}`}
                                                    className="flex items-center gap-3"
                                                >
                                                    <Avatar className="h-9 w-9 ring-1 ring-ocean-aqua/50">
                                                        {p.photo_url && (
                                                            <AvatarImage
                                                                src={
                                                                    p.photo_url
                                                                }
                                                                alt={
                                                                    p.nom_complet
                                                                }
                                                            />
                                                        )}
                                                        <AvatarFallback className="bg-gradient-to-br from-ocean-teal to-ocean-deep text-xs font-medium text-white">
                                                            {getInitials(
                                                                p.nom,
                                                                p.prenom,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <span className="font-medium text-ocean-deep hover:text-ocean-teal dark:text-sidebar-foreground dark:hover:text-ocean-teal">
                                                            {p.nom_complet}
                                                        </span>
                                                        {p.cin && (
                                                            <p className="text-xs text-slate-400 dark:text-sidebar-foreground/60">
                                                                {p.cin}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Link>
                                            </td>
                                        )}
                                        {visibleColumns.has('dossier') && (
                                            <td className="px-4 py-3">
                                                <span className="inline-block rounded-lg bg-ocean-aqua/30 px-2.5 py-1 font-mono text-xs text-ocean-deep dark:bg-sidebar-accent dark:text-sidebar-foreground/80">
                                                    {p.dossier_number}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.has('telephone') && (
                                            <td className="px-4 py-3 text-slate-600 dark:text-sidebar-foreground/70">
                                                {p.telephone ? (
                                                    <a
                                                        href={`tel:${p.telephone}`}
                                                        className="hover:text-ocean-teal"
                                                    >
                                                        {p.telephone}
                                                    </a>
                                                ) : (
                                                    <span className="text-ocean-aqua/60">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.has('sexe') && (
                                            <td className="px-4 py-3 text-slate-600 dark:text-sidebar-foreground/70">
                                                {p.sexe ? (
                                                    <span className="text-lg leading-none">
                                                        {getSexeIcon(p.sexe)}
                                                    </span>
                                                ) : (
                                                    <span className="text-ocean-aqua/60">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.has('age') && (
                                            <td className="px-4 py-3 text-slate-600 dark:text-sidebar-foreground/70">
                                                {p.age != null ? (
                                                    <span>{p.age} ans</span>
                                                ) : (
                                                    <span className="text-ocean-aqua/60">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        {visibleColumns.has('statut') && (
                                            <td className="px-4 py-3">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                        p.statut === 'actif'
                                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-600/30'
                                                            : 'bg-ocean-aqua/30 text-ocean-deep/60 ring-1 ring-ocean-aqua/40 dark:bg-sidebar-accent dark:text-sidebar-foreground/50',
                                                    )}
                                                >
                                                    {p.statut === 'actif'
                                                        ? 'Actif'
                                                        : 'Inactif'}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.has('medecin') && (
                                            <td className="px-4 py-3 text-slate-600 dark:text-sidebar-foreground/70">
                                                {p.medecin ? (
                                                    <span className="text-xs">
                                                        {p.medecin.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-ocean-aqua/60">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <Link
                                                    href={`/patients/${p.id}`}
                                                >
                                                    Voir
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {patients.meta.links && patients.meta.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <p className="text-sm text-slate-500 dark:text-sidebar-foreground/60">
                            Page {patients.meta.current_page} sur{' '}
                            {patients.meta.last_page}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {patients.meta.links.map((link, i) => (
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
                                            ? 'border-ocean-teal bg-ocean-deep text-white shadow-sm'
                                            : 'border-ocean-aqua/40 bg-white text-ocean-deep/70 hover:border-ocean-teal/50 hover:bg-ocean-aqua/20 dark:border-sidebar-border dark:bg-card dark:text-sidebar-foreground/70',
                                        !link.url &&
                                            'cursor-not-allowed opacity-40',
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

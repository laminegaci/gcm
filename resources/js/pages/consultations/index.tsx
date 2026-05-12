import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Filter, Plus, RefreshCw } from 'lucide-react';

import { ConsultationCard } from '@/components/consultation-card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConsultResource {
    id: number;
    motif: string;
    diagnostic: string | null;
    statut: 'en_cours' | 'terminee' | 'annulee';
    date_consultation: string;
    duree_minutes: number | null;
    medecin?: { id: number; name: string };
    patient?: { id: number; nom_complet: string };
}

interface PaginatedData {
    data: ConsultResource[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

interface Props {
    consultations: PaginatedData;
    filters: { statut?: string };
    patient?: { id: number; nom_complet: string } | null;
}

export default function ConsultationsIndex({
    consultations,
    filters,
    patient,
}: Props) {
    return (
        <>
            <Head
                title={
                    patient
                        ? `Consultations - ${patient.nom_complet}`
                        : 'Consultations'
                }
            />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                {patient && (
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/patients/${patient.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour au patient
                        </Link>
                    </Button>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-ocean-deep">
                            {patient
                                ? `Consultations — ${patient.nom_complet}`
                                : 'Consultations'}
                        </h1>
                        <p className="text-sm text-slate-500">
                            {consultations.meta.total} consultation
                            {consultations.meta.total > 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        router.reload({
                                            only: ['consultations'],
                                        })
                                    }
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Actualiser</TooltipContent>
                        </Tooltip>

                        <Select
                            value={filters.statut ?? ''}
                            onValueChange={(v) => {
                                router.get(
                                    window.location.pathname,
                                    { statut: v || undefined },
                                    { preserveState: true, replace: true },
                                );
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <Filter className="mr-2 h-3 w-3" />
                                <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=" ">Tous</SelectItem>
                                <SelectItem value="en_cours">
                                    En cours
                                </SelectItem>
                                <SelectItem value="terminee">
                                    Terminée
                                </SelectItem>
                                <SelectItem value="annulee">Annulée</SelectItem>
                            </SelectContent>
                        </Select>

                        {patient && (
                            <Button asChild>
                                <Link
                                    href={`/consultations/create?patient_id=${patient.id}`}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nouvelle consultation
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {consultations.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Calendar className="mb-3 h-12 w-12 text-slate-300" />
                            <p className="text-sm font-medium text-slate-500">
                                Aucune consultation
                            </p>
                            <p className="text-xs text-slate-400">
                                {patient
                                    ? 'Commencez par créer une nouvelle consultation.'
                                    : 'Sélectionnez un patient pour voir ses consultations.'}
                            </p>
                            {patient && (
                                <Button asChild className="mt-4">
                                    <Link
                                        href={`/consultations/create?patient_id=${patient.id}`}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nouvelle consultation
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {consultations.data.map((c) => (
                        <ConsultationCard
                            key={c.id}
                            consultation={c}
                            showPatient={!patient}
                        />
                    ))}
                </div>

                {consultations.meta.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {consultations.meta.links.map((link, i) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={i}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm text-slate-400"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                );
                            }

                            return (
                                <Button
                                    key={i}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() =>
                                        router.visit(link.url!, {
                                            preserveState: true,
                                        })
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

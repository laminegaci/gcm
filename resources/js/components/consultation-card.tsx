import { Link } from '@inertiajs/react';
import { Calendar, Clock, FileText, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Consult {
    id: number;
    motif: string;
    diagnostic: string | null;
    statut: 'en_cours' | 'terminee' | 'annulee';
    date_consultation: string;
    duree_minutes: number | null;
    medecin?: { id: number; name: string } | null;
    patient?: { id: number; nom_complet: string } | null;
}

interface Props {
    consultation: Consult;
    showPatient?: boolean;
}

const statusConfig: Record<string, { label: string; class: string }> = {
    en_cours: { label: 'En cours', class: 'bg-amber-100 text-amber-700' },
    terminee: { label: 'Terminée', class: 'bg-emerald-100 text-emerald-700' },
    annulee: { label: 'Annulée', class: 'bg-slate-200 text-slate-600' },
};

export function ConsultationCard({ consultation, showPatient }: Props) {
    const status = statusConfig[consultation.statut] ?? statusConfig.annulee;
    const date = new Date(consultation.date_consultation);
    const dateStr = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <Link href={`/consultations/${consultation.id}`} className="block">
            <Card
                className={cn(
                    'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                    consultation.statut === 'en_cours' &&
                        'border-amber-300 bg-amber-50/30',
                )}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 shrink-0 text-ocean-teal" />
                                <p className="truncate text-sm font-medium text-ocean-deep">
                                    {consultation.motif}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {dateStr}
                                </span>
                                {consultation.duree_minutes && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {consultation.duree_minutes} min
                                    </span>
                                )}
                                {showPatient && consultation.patient && (
                                    <span className="flex items-center gap-1">
                                        <User className="h-3.5 w-3.5" />
                                        {consultation.patient.nom_complet}
                                    </span>
                                )}
                                {consultation.medecin && (
                                    <span>Dr. {consultation.medecin.name}</span>
                                )}
                            </div>

                            {consultation.diagnostic && (
                                <p className="line-clamp-1 text-xs text-slate-600">
                                    {consultation.diagnostic}
                                </p>
                            )}
                        </div>

                        <Badge
                            className={cn('shrink-0 text-[10px]', status.class)}
                        >
                            {status.label}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

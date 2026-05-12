import { AlertTriangle, Pill, Droplets } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Allergie {
    id: number;
    nom: string;
    severite: string;
}

interface ActivePrescription {
    id: number;
    numero_ordonnance: string;
    lignes: string[];
}

interface LastConsultation {
    date_consultation: string;
    diagnostic: string | null;
}

interface Props {
    patient: {
        id: number;
        nom_complet: string;
        nom: string;
        prenom: string;
        date_naissance: string;
        age: number;
        sexe?: string;
        groupe_sanguin: string | null;
        photo_url: string | null;
        allergies?: Allergie[];
    };
    lastConsultation?: LastConsultation | null;
    activePrescriptions?: ActivePrescription[];
}

const severityStyles: Record<string, string> = {
    legere: 'bg-amber-100 text-amber-700',
    moderee: 'bg-orange-100 text-orange-700',
    severe: 'bg-red-100 text-red-700',
};

export function PatientMiniCard({
    patient,
    lastConsultation,
    activePrescriptions,
}: Props) {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14 shrink-0">
                            {patient.photo_url && (
                                <AvatarImage
                                    src={patient.photo_url}
                                    alt={patient.nom_complet}
                                />
                            )}
                            <AvatarFallback className="bg-ocean-teal/20 text-lg font-semibold text-ocean-teal">
                                {(
                                    patient.prenom[0] + patient.nom[0]
                                ).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-ocean-deep">
                                {patient.nom_complet}
                            </p>
                            <p className="text-xs text-slate-500">
                                {patient.age} ans ·{' '}
                                {patient.sexe === 'M' ? 'Homme' : 'Femme'}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                                {patient.groupe_sanguin && (
                                    <Badge
                                        variant="outline"
                                        className="border-red-200 text-[10px] text-red-600"
                                    >
                                        <Droplets className="mr-0.5 h-3 w-3" />
                                        {patient.groupe_sanguin}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {patient.allergies && patient.allergies.length > 0 && (
                <Card>
                    <CardHeader className="px-4 py-3">
                        <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Allergies
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1.5 px-4 pb-4">
                        {patient.allergies.map((a) => (
                            <div
                                key={a.id}
                                className="flex items-center justify-between"
                            >
                                <span className="text-sm text-slate-700">
                                    {a.nom}
                                </span>
                                <Badge
                                    className={cn(
                                        'text-[10px]',
                                        severityStyles[a.severite],
                                    )}
                                >
                                    {a.severite}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {lastConsultation && (
                <Card>
                    <CardHeader className="px-4 py-3">
                        <CardTitle className="text-sm font-medium">
                            Dernière consultation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 px-4 pb-4">
                        <p className="text-xs text-slate-500">
                            {lastConsultation.date_consultation}
                        </p>
                        <p className="line-clamp-2 text-sm text-slate-700">
                            {lastConsultation.diagnostic ?? 'Aucun diagnostic'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {activePrescriptions && activePrescriptions.length > 0 && (
                <Card>
                    <CardHeader className="px-4 py-3">
                        <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
                            <Pill className="h-4 w-4 text-ocean-coral" />
                            Médicaments actifs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 px-4 pb-4">
                        {activePrescriptions.map((p) => (
                            <div key={p.id}>
                                <p className="font-mono text-xs text-ocean-teal">
                                    {p.numero_ordonnance}
                                </p>
                                <ul className="mt-1 space-y-0.5">
                                    {p.lignes.map((l, i) => (
                                        <li
                                            key={i}
                                            className="text-sm text-slate-700"
                                        >
                                            · {l}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export function PatientMiniCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-14 animate-pulse rounded-full bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

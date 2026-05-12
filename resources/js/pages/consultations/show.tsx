import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    ClipboardList,
    Download,
    FileText,
    FlaskConical,
    Heart,
    Ruler,
    Thermometer,
    Weight,
} from 'lucide-react';
import { toast } from 'sonner';

import { AnalyseDialog } from '@/components/analyse-dialog';
import { CertificatDialog } from '@/components/certificat-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Consultation } from '@/types/consultation';

interface Props {
    consultation: { data: Consultation };
}

const statusConfig: Record<string, { label: string; class: string }> = {
    en_cours: { label: 'En cours', class: 'bg-amber-100 text-amber-700' },
    terminee: { label: 'Terminée', class: 'bg-emerald-100 text-emerald-700' },
    annulee: { label: 'Annulée', class: 'bg-slate-200 text-slate-600' },
};

export default function ConsultationShow({ consultation }: Props) {
    const c = consultation.data;
    const status = statusConfig[c.statut] ?? statusConfig.annulee;
    const isAuthor =
        c.medecin_id === (window as unknown as Record<string, unknown>).userId;
    const canEdit = c.statut === 'en_cours' && isAuthor;
    const dateStr = c.date_consultation
        ? new Date(c.date_consultation).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

    function handleTerminer() {
        if (
            !confirm(
                'Terminer la consultation ? Les modifications ne seront plus possibles.',
            )
        ) {
return;
}

        router.post(`/consultations/${c.id}/terminer`, {}, {
            onSuccess: () => toast.success('Consultation terminée.'),
        });
    }

    return (
        <>
            <Head title={`Consultation — ${dateStr}`} />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link
                            href={
                                c.patient
                                    ? `/patients/${c.patient.id}`
                                    : '/consultations'
                            }
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        {c.patient && (
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={`/consultations/create?patient_id=${c.patient.id}`}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Nouvelle consultation
                                </Link>
                            </Button>
                        )}
                        {canEdit && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTerminer}
                                >
                                    <Activity className="mr-2 h-4 w-4" />
                                    Terminer
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* En-tête */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-ocean-deep">
                            {c.motif}
                        </h1>
                        <p className="text-sm text-slate-500">{dateStr}</p>
                        {c.duree_minutes && (
                            <p className="text-xs text-slate-400">
                                Durée: {c.duree_minutes} min
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={cn('text-xs', status.class)}>
                            {status.label}
                        </Badge>
                        {c.medecin && (
                            <span className="text-sm text-slate-500">
                                Dr. {c.medecin.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Constantes vitales */}
                {c.constantes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Heart className="h-5 w-5 text-ocean-coral" />
                                Constantes vitales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <MetricCard
                                    icon={
                                        <Activity className="h-4 w-4 text-ocean-teal" />
                                    }
                                    label="Tension"
                                    value={
                                        c.constantes.tension_systolique &&
                                        c.constantes.tension_diastolique
                                            ? `${c.constantes.tension_systolique}/${c.constantes.tension_diastolique}`
                                            : '—'
                                    }
                                    unit="mmHg"
                                />
                                <MetricCard
                                    icon={
                                        <Heart className="h-4 w-4 text-ocean-coral" />
                                    }
                                    label="Pouls"
                                    value={
                                        c.constantes.pouls?.toString() ?? '—'
                                    }
                                    unit="bpm"
                                />
                                <MetricCard
                                    icon={
                                        <Thermometer className="h-4 w-4 text-amber-500" />
                                    }
                                    label="Température"
                                    value={
                                        c.constantes.temperature?.toString() ??
                                        '—'
                                    }
                                    unit="°C"
                                />
                                <MetricCard
                                    icon={
                                        <Weight className="h-4 w-4 text-ocean-deep" />
                                    }
                                    label="Poids"
                                    value={
                                        c.constantes.poids?.toString() ?? '—'
                                    }
                                    unit="kg"
                                />
                                <MetricCard
                                    icon={
                                        <Ruler className="h-4 w-4 text-ocean-deep" />
                                    }
                                    label="Taille"
                                    value={
                                        c.constantes.taille?.toString() ?? '—'
                                    }
                                    unit="cm"
                                />
                                <MetricCard
                                    icon={
                                        <Activity className="h-4 w-4 text-blue-500" />
                                    }
                                    label="SpO₂"
                                    value={c.constantes.spo2?.toString() ?? '—'}
                                    unit="%"
                                />
                                {c.constantes.imc && (
                                    <MetricCard
                                        icon={
                                            <Activity className="h-4 w-4 text-ocean-teal" />
                                        }
                                        label="IMC"
                                        value={c.constantes.imc.toFixed(1)}
                                        unit="kg/m²"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sections cliniques */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Section title="Motif" content={c.motif} />
                    <Section title="Symptômes" content={c.symptomes} />
                    <Section
                        title="Examen clinique"
                        content={c.examen_clinique}
                    />
                    <Section title="Diagnostic" content={c.diagnostic} />
                </div>

                {/* Notes privées — médecin uniquement */}
                {c.notes_privees && (
                    <Card className="border-amber-200 bg-amber-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm text-amber-700">
                                <AlertTriangle className="h-4 w-4" />
                                Notes privées (visible médecin uniquement)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap text-slate-700">
                                {c.notes_privees}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Separator />

                {/* Ordonnances liées */}
                <SectionList
                    title="Ordonnances"
                    icon={<ClipboardList className="h-5 w-5 text-ocean-teal" />}
                    items={c.prescriptions}
                    emptyText="Aucune ordonnance liée."
                    renderItem={(p) => (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                            <div>
                                <Link
                                    href={`/prescriptions/${p.id}`}
                                    className="font-mono text-sm font-medium text-ocean-teal hover:underline"
                                >
                                    {p.numero_ordonnance}
                                </Link>
                                <Badge className="ml-2 text-[10px]">
                                    {p.statut}
                                </Badge>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <a
                                    href={`/prescriptions/${p.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="mr-1 h-3 w-3" />
                                    PDF
                                </a>
                            </Button>
                        </div>
                    )}
                    action={
                        canEdit && c.patient ? (
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={`/prescriptions/create?consultation_id=${c.id}&patient_id=${c.patient.id}`}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Nouvelle ordonnance
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                {/* Certificats */}
                <SectionList
                    title="Certificats médicaux"
                    icon={<FileText className="h-5 w-5 text-amber-600" />}
                    items={c.certificats}
                    emptyText="Aucun certificat."
                    renderItem={(cert) => (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                            <div>
                                <span className="font-mono text-sm font-medium text-slate-700">
                                    {cert.numero_certificat}
                                </span>
                                <Badge
                                    variant="outline"
                                    className="ml-2 text-[10px]"
                                >
                                    {cert.type}
                                </Badge>
                                {cert.nombre_jours && (
                                    <span className="ml-2 text-xs text-slate-500">
                                        {cert.nombre_jours} jour
                                        {cert.nombre_jours > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <a
                                    href={`/certificats/${cert.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="mr-1 h-3 w-3" />
                                    PDF
                                </a>
                            </Button>
                        </div>
                    )}
                    action={
                        canEdit ? (
                            <CertificatDialog consultationId={c.id} />
                        ) : null
                    }
                />

                {/* Demandes d'analyses */}
                <SectionList
                    title="Demandes d'analyses"
                    icon={<FlaskConical className="h-5 w-5 text-ocean-teal" />}
                    items={c.demandes_analyses}
                    emptyText="Aucune demande d'analyses."
                    renderItem={(d) => (
                        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                            <div>
                                <span className="font-mono text-sm font-medium text-slate-700">
                                    {d.numero_demande}
                                </span>
                                <Badge
                                    className={cn(
                                        'ml-2 text-[10px]',
                                        d.statut === 'recu' &&
                                            'bg-emerald-100 text-emerald-700',
                                        d.statut === 'en_attente' &&
                                            'bg-amber-100 text-amber-700',
                                    )}
                                >
                                    {d.statut === 'en_attente'
                                        ? 'En attente'
                                        : d.statut === 'recu'
                                          ? 'Reçu'
                                          : d.statut}
                                </Badge>
                                <p className="mt-1 text-xs text-slate-500">
                                    {d.examens?.length} examen
                                    {d.examens?.length > 1 ? 's' : ''}
                                </p>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <a
                                    href={`/analyses/${d.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Download className="mr-1 h-3 w-3" />
                                    PDF
                                </a>
                            </Button>
                        </div>
                    )}
                    action={
                        canEdit ? <AnalyseDialog consultationId={c.id} /> : null
                    }
                />

                {/* Actions */}
                {canEdit && (
                    <div className="flex flex-wrap justify-end gap-3 pt-4">
                        <CertificatDialog consultationId={c.id} />
                        <AnalyseDialog consultationId={c.id} />
                    </div>
                )}
            </div>
        </>
    );
}

function MetricCard({
    icon,
    label,
    value,
    unit,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    unit: string;
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-500">
                {icon}
                {label}
            </div>
            <p className="text-lg font-semibold text-ocean-deep">
                {value}
                <span className="ml-1 text-xs font-normal text-slate-400">
                    {unit}
                </span>
            </p>
        </div>
    );
}

function Section({
    title,
    content,
}: {
    title: string;
    content: string | null;
}) {
    if (!content) {
return null;
}

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm whitespace-pre-wrap text-slate-800">
                    {content}
                </p>
            </CardContent>
        </Card>
    );
}

function SectionList<T extends { id: number }>({
    title,
    icon,
    items,
    emptyText,
    renderItem,
    action,
}: {
    title: string;
    icon: React.ReactNode;
    items: T[] | undefined;
    emptyText: string;
    renderItem: (item: T) => React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                    {icon}
                    {title}
                </CardTitle>
                {action}
            </CardHeader>
            <CardContent className="space-y-2">
                {(!items || items.length === 0) && (
                    <p className="py-4 text-center text-sm text-slate-500">
                        {emptyText}
                    </p>
                )}
                {items?.map((item) => (
                    <div key={item.id}>{renderItem(item)}</div>
                ))}
            </CardContent>
        </Card>
    );
}

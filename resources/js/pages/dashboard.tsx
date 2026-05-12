import { Head } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    FlaskConical,
    TrendingUp,
    Users,
} from 'lucide-react';

import { dashboard } from '@/routes';

const stats = [
    {
        label: 'Patients actifs',
        value: '1,284',
        change: '+12%',
        trend: 'up',
        icon: Users,
        gradient: 'from-ocean-teal to-ocean-deep',
        badgeColor: 'bg-ocean-teal/10 text-ocean-teal',
    },
    {
        label: "Rendez-vous aujourd'hui",
        value: '24',
        change: '+4',
        trend: 'up',
        icon: CalendarDays,
        gradient: 'from-ocean-aqua to-ocean-teal',
        badgeColor: 'bg-ocean-aqua/30 text-ocean-deep',
    },
    {
        label: 'Examens en attente',
        value: '18',
        change: '-3',
        trend: 'down',
        icon: FlaskConical,
        gradient: 'from-ocean-seafoam to-ocean-teal',
        badgeColor: 'bg-ocean-seafoam/30 text-ocean-deep',
    },
    {
        label: "Taux d'occupation",
        value: '76%',
        change: '+5%',
        trend: 'up',
        icon: Activity,
        gradient: 'from-ocean-coral to-ocean-deep',
        badgeColor: 'bg-ocean-coral/10 text-ocean-coral',
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-ocean-deep dark:text-sidebar-foreground">
                        Tableau de bord
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-sidebar-foreground/60">
                        Aperçu de votre activité du jour
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="group relative overflow-hidden rounded-2xl border border-ocean-aqua/30 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ocean-teal/5 dark:border-sidebar-border dark:bg-card"
                        >
                            {/* Gradient accent bar */}
                            <div
                                className={cn(
                                    'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                                    stat.gradient,
                                )}
                            />

                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-500 dark:text-sidebar-foreground/60">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold tracking-tight text-ocean-deep dark:text-sidebar-foreground">
                                        {stat.value}
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        'flex h-11 w-11 items-center justify-center rounded-xl',
                                        stat.badgeColor,
                                    )}
                                >
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-1.5">
                                <TrendingUp
                                    className={cn(
                                        'h-3.5 w-3.5',
                                        stat.trend === 'up'
                                            ? 'text-emerald-500'
                                            : 'text-ocean-coral',
                                    )}
                                />
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        stat.trend === 'up'
                                            ? 'text-emerald-600'
                                            : 'text-ocean-coral',
                                    )}
                                >
                                    {stat.change}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-sidebar-foreground/50">
                                    vs. hier
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Activity & Recent section */}
                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Activity chart placeholder */}
                    <div className="rounded-2xl border border-ocean-aqua/30 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-sidebar-border dark:bg-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-ocean-deep dark:text-sidebar-foreground">
                                Activité hebdomadaire
                            </h3>
                            <span className="rounded-full bg-ocean-teal/10 px-3 py-1 text-xs font-medium text-ocean-teal">
                                Cette semaine
                            </span>
                        </div>
                        <div className="mt-6 grid grid-cols-7 gap-2">
                            {[
                                'Lun',
                                'Mar',
                                'Mer',
                                'Jeu',
                                'Ven',
                                'Sam',
                                'Dim',
                            ].map((day, i) => (
                                <div
                                    key={day}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <span className="text-xs text-slate-400 dark:text-sidebar-foreground/50">
                                        {day}
                                    </span>
                                    <div
                                        className={cn(
                                            'w-full rounded-lg bg-gradient-to-t from-ocean-teal/60 to-ocean-aqua/40 transition-all duration-300 hover:from-ocean-teal hover:to-ocean-aqua',
                                            i === 6
                                                ? 'h-8'
                                                : `h-${[12, 16, 10, 20, 14, 6, 8][i]}`,
                                        )}
                                        style={{
                                            height: `${[40, 55, 35, 70, 50, 20, 28][i]}%`,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent patients placeholder */}
                    <div className="rounded-2xl border border-ocean-aqua/30 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-sidebar-border dark:bg-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-ocean-deep dark:text-sidebar-foreground">
                                Derniers patients
                            </h3>
                            <span className="rounded-full bg-ocean-teal/10 px-3 py-1 text-xs font-medium text-ocean-teal">
                                Aujourd'hui
                            </span>
                        </div>
                        <div className="mt-6 space-y-4">
                            {[
                                {
                                    name: 'Sophie Martin',
                                    time: '09:30',
                                    status: 'Consultation',
                                },
                                {
                                    name: 'Ahmed Benali',
                                    time: '10:15',
                                    status: 'Suivi',
                                },
                                {
                                    name: 'Marie Dubois',
                                    time: '11:00',
                                    status: 'Urgence',
                                    critical: true,
                                },
                                {
                                    name: 'Paul Lefèvre',
                                    time: '14:30',
                                    status: 'Bilan',
                                },
                                {
                                    name: 'Lucie Petit',
                                    time: '15:45',
                                    status: 'Consultation',
                                },
                            ].map((patient, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 rounded-xl border border-ocean-aqua/20 bg-ocean-sand/50 p-3 transition-colors hover:bg-ocean-aqua/20 dark:border-sidebar-border dark:bg-sidebar-accent"
                                >
                                    <div
                                        className={cn(
                                            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium',
                                            patient.critical
                                                ? 'bg-ocean-coral/15 text-ocean-coral'
                                                : 'bg-ocean-teal/15 text-ocean-teal',
                                        )}
                                    >
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-ocean-deep dark:text-sidebar-foreground">
                                            {patient.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-sidebar-foreground/60">
                                            {patient.time}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                                            patient.critical
                                                ? 'bg-ocean-coral/10 text-ocean-coral'
                                                : 'bg-ocean-teal/10 text-ocean-teal',
                                        )}
                                    >
                                        {patient.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

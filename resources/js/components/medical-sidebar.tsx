import { useCallback, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    CalendarDays,
    ChevronLeft,
    FilePlus2,
    FileText,
    FlaskConical,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Stethoscope,
    UserPlus,
    Users,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type NavTone = 'default' | 'critical';

interface NavItem {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    tone?: NavTone;
}

interface NavSection {
    id: string;
    title: string;
    items: NavItem[];
    tone?: NavTone;
}

interface DoctorProfile {
    name: string;
    specialty: string;
    avatarUrl?: string;
    initials: string;
    onDuty: boolean;
}

interface MedicalSidebarProps {
    activeKey?: string;
    onNavigate?: (key: string) => void;
    doctor?: DoctorProfile;
    facilityName?: string;
    appVersion?: string;
    defaultCollapsed?: boolean;
    className?: string;
}

const PRIMARY_NAV: NavSection = {
    id: 'primary',
    title: 'Navigation',
    items: [
        { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { key: 'patients', label: 'Patients', icon: Users },
        { key: 'appointments', label: 'Rendez-vous', icon: CalendarDays, badge: 4 },
        { key: 'prescriptions', label: 'Ordonnances', icon: FileText },
        { key: 'lab-results', label: "Résultats d'examens", icon: FlaskConical, badge: 2 },
        { key: 'messages', label: 'Messagerie', icon: MessageSquare, badge: 7 },
    ],
};

const EMERGENCY_NAV: NavSection = {
    id: 'emergency',
    title: 'Urgences',
    tone: 'critical',
    items: [
        { key: 'alerts', label: 'Alertes actives', icon: AlertTriangle, badge: 3, tone: 'critical' },
        { key: 'critical-patients', label: 'Patients critiques', icon: Activity, badge: 1, tone: 'critical' },
    ],
};

const SHORTCUTS: NavItem[] = [
    { key: 'new-consultation', label: 'Nouvelle consultation', icon: FilePlus2 },
    { key: 'add-patient', label: 'Ajouter un patient', icon: UserPlus },
];

const DEFAULT_DOCTOR: DoctorProfile = {
    name: 'Dr. Sarah Bennani',
    specialty: 'Cardiologie',
    initials: 'SB',
    onDuty: true,
};

export function MedicalSidebar({
    activeKey: controlledActiveKey,
    onNavigate,
    doctor = DEFAULT_DOCTOR,
    facilityName = 'Clinique Saint-Michel',
    appVersion = 'v1.4.2',
    defaultCollapsed = false,
    className,
}: MedicalSidebarProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [internalActive, setInternalActive] = useState('dashboard');
    const activeKey = controlledActiveKey ?? internalActive;

    const handleNavigate = useCallback(
        (key: string) => {
            if (controlledActiveKey === undefined) setInternalActive(key);
            onNavigate?.(key);
        },
        [controlledActiveKey, onNavigate],
    );

    const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);

    return (
        <TooltipProvider delayDuration={150}>
            <aside
                aria-label="Navigation principale"
                className={cn(
                    'sticky top-0 z-10 flex h-screen flex-col border-r border-slate-200 bg-white text-slate-700',
                    'transition-[width] duration-200 ease-out',
                    collapsed ? 'w-[72px]' : 'w-72',
                    className,
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-sm"
                        aria-hidden
                    >
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{facilityName}</p>
                            <p className="truncate text-xs text-slate-500">Espace praticien</p>
                        </div>
                    )}
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={toggleCollapsed}
                        aria-label={collapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'}
                        aria-expanded={!collapsed}
                        className="h-8 w-8 shrink-0 text-slate-500 hover:text-slate-900"
                    >
                        <ChevronLeft className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')} />
                    </Button>
                </div>

                {/* Doctor profile */}
                <div className={cn('flex items-center gap-3 px-4 py-4', collapsed && 'justify-center px-2')}>
                    <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 ring-2 ring-white">
                            {doctor.avatarUrl && <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />}
                            <AvatarFallback className="bg-blue-100 text-sm font-medium text-blue-700">
                                {doctor.initials}
                            </AvatarFallback>
                        </Avatar>
                        <span
                            className={cn(
                                'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white',
                                doctor.onDuty ? 'bg-emerald-500' : 'bg-slate-400',
                            )}
                            aria-label={doctor.onDuty ? 'En service' : 'Hors service'}
                        />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{doctor.name}</p>
                            <p className="truncate text-xs text-slate-500">{doctor.specialty}</p>
                            <span
                                className={cn(
                                    'mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide',
                                    doctor.onDuty ? 'text-emerald-600' : 'text-slate-500',
                                )}
                            >
                                <span
                                    className={cn(
                                        'h-1.5 w-1.5 rounded-full',
                                        doctor.onDuty ? 'bg-emerald-500' : 'bg-slate-400',
                                    )}
                                />
                                {doctor.onDuty ? 'En service' : 'Hors service'}
                            </span>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Scrollable nav body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
                    <NavGroup
                        section={PRIMARY_NAV}
                        collapsed={collapsed}
                        activeKey={activeKey}
                        onNavigate={handleNavigate}
                    />
                    <Separator className="my-2" />
                    <NavGroup
                        section={EMERGENCY_NAV}
                        collapsed={collapsed}
                        activeKey={activeKey}
                        onNavigate={handleNavigate}
                    />
                    <Separator className="my-2" />
                    <NavGroup
                        section={{ id: 'shortcuts', title: 'Raccourcis rapides', items: SHORTCUTS }}
                        collapsed={collapsed}
                        activeKey={activeKey}
                        onNavigate={handleNavigate}
                        variant="shortcut"
                    />
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-2">
                    <NavButton
                        item={{ key: 'settings', label: 'Paramètres', icon: Settings }}
                        active={activeKey === 'settings'}
                        collapsed={collapsed}
                        onClick={() => handleNavigate('settings')}
                    />
                    <NavButton
                        item={{ key: 'logout', label: 'Déconnexion', icon: LogOut }}
                        active={false}
                        collapsed={collapsed}
                        onClick={() => handleNavigate('logout')}
                    />
                    {!collapsed && (
                        <p className="mt-2 px-3 text-[11px] text-slate-400">GCM • {appVersion}</p>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    );
}

interface NavGroupProps {
    section: NavSection;
    collapsed: boolean;
    activeKey: string;
    onNavigate: (key: string) => void;
    variant?: 'default' | 'shortcut';
}

function NavGroup({ section, collapsed, activeKey, onNavigate, variant = 'default' }: NavGroupProps) {
    return (
        <div className="px-2 py-1">
            {!collapsed && (
                <p
                    className={cn(
                        'mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider',
                        section.tone === 'critical' ? 'text-red-600' : 'text-slate-400',
                    )}
                >
                    {section.title}
                </p>
            )}
            <ul className="space-y-0.5" role="list">
                {section.items.map((item) => (
                    <li key={item.key}>
                        <NavButton
                            item={item}
                            active={activeKey === item.key}
                            collapsed={collapsed}
                            onClick={() => onNavigate(item.key)}
                            variant={variant}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

interface NavButtonProps {
    item: NavItem;
    active: boolean;
    collapsed: boolean;
    onClick: () => void;
    variant?: 'default' | 'shortcut';
}

function NavButton({ item, active, collapsed, onClick, variant = 'default' }: NavButtonProps) {
    const { label, icon: Icon, badge, tone } = item;
    const isCritical = tone === 'critical';
    const isShortcut = variant === 'shortcut';

    const button = (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group relative flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none',
                'transition-colors duration-150 ease-out',
                'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
                collapsed && 'justify-center px-2',
                // Active state
                active && !isCritical && 'bg-blue-50 text-blue-700',
                active && isCritical && 'bg-red-50 text-red-700',
                // Idle state
                !active && !isCritical && 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                !active && isCritical && 'text-red-600 hover:bg-red-50 hover:text-red-700',
                // Shortcut tweak: dashed look so it reads as an action, not a destination
                isShortcut && !active && 'border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/40',
            )}
        >
            {/* Left highlight bar (active indicator) */}
            <span
                aria-hidden
                className={cn(
                    'absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full transition-opacity duration-150',
                    active ? 'opacity-100' : 'opacity-0',
                    isCritical ? 'bg-red-600' : 'bg-blue-600',
                )}
            />
            <Icon
                className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-colors',
                    active && !isCritical && 'text-blue-600',
                    active && isCritical && 'text-red-600',
                )}
            />
            {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
            {!collapsed && badge !== undefined && badge > 0 && (
                <Badge
                    variant={isCritical ? 'destructive' : 'secondary'}
                    className={cn(
                        'h-5 min-w-5 justify-center px-1.5 text-[10px] font-semibold',
                        !isCritical && 'bg-blue-100 text-blue-700 hover:bg-blue-100',
                    )}
                >
                    {badge > 99 ? '99+' : badge}
                </Badge>
            )}
            {/* Collapsed badge dot */}
            {collapsed && badge !== undefined && badge > 0 && (
                <span
                    aria-hidden
                    className={cn(
                        'absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white',
                        isCritical ? 'bg-red-500' : 'bg-blue-500',
                    )}
                />
            )}
        </button>
    );

    if (!collapsed) return button;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
                <span>{label}</span>
                {badge !== undefined && badge > 0 && (
                    <Badge
                        variant={isCritical ? 'destructive' : 'secondary'}
                        className="h-4 min-w-4 px-1 text-[10px]"
                    >
                        {badge}
                    </Badge>
                )}
            </TooltipContent>
        </Tooltip>
    );
}

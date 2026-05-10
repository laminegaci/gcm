import {
    Activity,
    AlertTriangle,
    CalendarDays,
    FlaskConical,
    FileText,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Stethoscope,
    Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    collapsed?: boolean;
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
    { key: 'new-consultation', label: 'Nouvelle consultation', icon: FileText },
    { key: 'add-patient', label: 'Ajouter un patient', icon: Users },
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
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    className,
}: MedicalSidebarProps) {
    const [internalActive, setInternalActive] = useState('dashboard');

    const collapsed = controlledCollapsed ?? defaultCollapsed;
    const activeKey = controlledActiveKey ?? internalActive;

    const handleNavigate = useCallback(
        (key: string) => {
            if (controlledActiveKey === undefined) {
setInternalActive(key);
}

            onNavigate?.(key);
        },
        [controlledActiveKey, onNavigate],
    );

    return (
        <TooltipProvider delayDuration={150}>
            <aside
                aria-label="Navigation principale"
                className={cn(
                    'sticky top-0 z-10 flex h-screen flex-col',
                    'bg-sidebar text-sidebar-foreground border-r border-sidebar-border',
                    'transition-[width] duration-200 ease-out',
                    collapsed ? 'w-[72px]' : 'w-72',
                    className,
                )}
            >
                {/* Header — Ocean logo area */}
                <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-teal to-ocean-deep text-white shadow-lg shadow-ocean-deep/20"
                        aria-hidden
                    >
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-sidebar-foreground">
                                {facilityName}
                            </p>
                            <p className="truncate text-xs text-sidebar-foreground/60">
                                Espace praticien
                            </p>
                        </div>
                    )}
                </div>

                {/* Doctor profile */}
                <div className={cn('flex items-center gap-3 px-4 py-4', collapsed && 'justify-center px-2')}>
                    <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 ring-2 ring-sidebar-border">
                            {doctor.avatarUrl && <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />}
                            <AvatarFallback className="bg-ocean-teal/20 text-sm font-medium text-ocean-aqua">
                                {doctor.initials}
                            </AvatarFallback>
                        </Avatar>
                        <span
                            className={cn(
                                'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-sidebar',
                                doctor.onDuty ? 'bg-emerald-400' : 'bg-slate-500',
                            )}
                            aria-label={doctor.onDuty ? 'En service' : 'Hors service'}
                        />
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-sidebar-foreground">
                                {doctor.name}
                            </p>
                            <p className="truncate text-xs text-sidebar-foreground/60">
                                {doctor.specialty}
                            </p>
                            <span
                                className={cn(
                                    'mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide',
                                    doctor.onDuty ? 'text-emerald-400' : 'text-sidebar-foreground/50',
                                )}
                            >
                                <span
                                    className={cn(
                                        'h-1.5 w-1.5 rounded-full',
                                        doctor.onDuty ? 'bg-emerald-400' : 'bg-sidebar-foreground/50',
                                    )}
                                />
                                {doctor.onDuty ? 'En service' : 'Hors service'}
                            </span>
                        </div>
                    )}
                </div>

                <Separator className="bg-sidebar-border/50" />

                {/* Scrollable nav body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
                    <NavGroup
                        section={PRIMARY_NAV}
                        collapsed={collapsed}
                        activeKey={activeKey}
                        onNavigate={handleNavigate}
                    />
                    <Separator className="my-2 bg-sidebar-border/50" />
                    <NavGroup
                        section={EMERGENCY_NAV}
                        collapsed={collapsed}
                        activeKey={activeKey}
                        onNavigate={handleNavigate}
                    />
                    <Separator className="my-2 bg-sidebar-border/50" />
                    <NavGroup
                        section={{ id: 'shortcuts', title: 'Raccourcis rapides', items: SHORTCUTS }}
                        collapsed={collapsed}
                        activeKey={activeKey}
                        onNavigate={handleNavigate}
                        variant="shortcut"
                    />
                </div>

                {/* Footer */}
                <div className="border-t border-sidebar-border p-2">
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
                        <p className="mt-2 px-3 text-[11px] text-sidebar-foreground/40">
                            GCM • {appVersion}
                        </p>
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
                        section.tone === 'critical'
                            ? 'text-ocean-coral'
                            : 'text-sidebar-foreground/50',
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
                'group relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none',
                'transition-all duration-150 ease-out',
                'focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar',
                collapsed && 'justify-center px-2',
                // Active state
                active && !isCritical && 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm',
                active && isCritical && 'bg-ocean-coral/15 text-ocean-coral',
                // Idle state
                !active && !isCritical && 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                !active && isCritical && 'text-ocean-coral/80 hover:bg-ocean-coral/10 hover:text-ocean-coral',
                // Shortcut
                isShortcut && !active && 'border border-dashed border-sidebar-border hover:border-ocean-teal/40 hover:bg-sidebar-accent',
            )}
        >
            <Icon
                className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-colors',
                    active && !isCritical && 'text-ocean-teal',
                    active && isCritical && 'text-ocean-coral',
                )}
            />
            {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
            {!collapsed && badge !== undefined && badge > 0 && (
                <Badge
                    className={cn(
                        'h-5 min-w-5 justify-center px-1.5 text-[10px] font-semibold',
                        isCritical
                            ? 'bg-ocean-coral/20 text-ocean-coral'
                            : 'bg-ocean-teal/20 text-ocean-teal',
                    )}
                >
                    {badge > 99 ? '99+' : badge}
                </Badge>
            )}
            {collapsed && badge !== undefined && badge > 0 && (
                <span
                    aria-hidden
                    className={cn(
                        'absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-sidebar',
                        isCritical ? 'bg-ocean-coral' : 'bg-ocean-teal',
                    )}
                />
            )}
        </button>
    );

    if (!collapsed) {
return button;
}

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2 bg-ocean-deep text-white border-ocean-teal/30">
                <span>{label}</span>
                {badge !== undefined && badge > 0 && (
                    <Badge
                        className={cn(
                            'h-4 min-w-4 px-1 text-[10px]',
                            isCritical
                                ? 'bg-ocean-coral/20 text-ocean-coral'
                                : 'bg-ocean-teal/20 text-ocean-teal',
                        )}
                    >
                        {badge}
                    </Badge>
                )}
            </TooltipContent>
        </Tooltip>
    );
}

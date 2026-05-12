import { router, usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

import { MedicalSidebar } from '@/components/medical-sidebar';
import { dashboard, logout } from '@/routes';
import consultations from '@/routes/consultations';
import patients from '@/routes/patients';
import prescriptions from '@/routes/prescriptions';
import { edit as editProfile } from '@/routes/profile';


const ROUTE_MAP: Record<string, string> = {
    dashboard: dashboard().url,
    patients: patients.index().url,
    prescriptions: prescriptions.index().url,
    consultations: consultations.index().url,
    settings: editProfile().url,
};

function getInitials(name: string): string {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || '?'
    );
}

interface AppSidebarProps {
    collapsed?: boolean;
}

export function AppSidebar({ collapsed }: AppSidebarProps = {}) {
    const { auth } = usePage().props as unknown as {
        auth: { user: { name: string; email: string } | null };
    };
    const currentUrl = usePage().url;

    const activeKey = useMemo(() => {
        if (currentUrl.startsWith('/prescriptions')) {
            return 'prescriptions';
        }

        if (currentUrl.startsWith('/consultations')) {
            return 'consultations';
        }

        if (currentUrl.startsWith('/patients')) {
            return 'patients';
        }

        const match = Object.entries(ROUTE_MAP).find(([, href]) =>
            currentUrl.startsWith(href),
        );

        return match?.[0] ?? 'dashboard';
    }, [currentUrl]);

    const handleNavigate = useCallback((key: string) => {
        if (key === 'logout') {
            router.visit(logout().url, { method: 'post' });

            return;
        }

        const href = ROUTE_MAP[key];

        if (href) {
            router.visit(href);
        }
    }, []);

    const doctor = auth.user
        ? {
              name: auth.user.name,
              specialty: 'Praticien',
              initials: getInitials(auth.user.name),
              onDuty: true,
          }
        : undefined;

    return (
        <MedicalSidebar
            activeKey={activeKey}
            onNavigate={handleNavigate}
            doctor={doctor}
            collapsed={collapsed}
        />
    );
}

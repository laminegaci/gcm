import { router, usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

import { MedicalSidebar } from '@/components/medical-sidebar';
import { dashboard, logout } from '@/routes';
import patients from '@/routes/patients';
import { edit as editProfile } from '@/routes/profile';

// Maps sidebar nav keys → real Inertia routes (where they exist).
// Keys not listed here are visual-only for now.
const ROUTE_MAP: Record<string, string> = {
    dashboard: dashboard().url,
    patients: patients.index().url,
    settings: editProfile().url,
};

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || '?';
}

export function AppSidebar() {
    const { auth } = usePage().props as unknown as {
        auth: { user: { name: string; email: string } | null };
    };
    const currentUrl = usePage().url;

    // Derive the active sidebar key from the current URL.
    const activeKey = useMemo(() => {
        // Patient sub-pages (create, show, etc.) should highlight "Patients"
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
        />
    );
}

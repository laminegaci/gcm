import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-slate-50">
            <AppSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-6">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </header>
                <main className="flex-1 overflow-x-hidden">{children}</main>
            </div>
        </div>
    );
}

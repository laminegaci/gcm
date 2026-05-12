import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Languages,
    Maximize,
    Minimize,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    Search,
    Sun,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import patients from '@/routes/patients';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { auth } = usePage().props as {
        auth?: { user?: { name: string; email: string; avatar?: string } };
    };
    const getInitials = useInitials();
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);

        document.addEventListener('fullscreenchange', handler);

        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }, []);

    const cycleAppearance = useCallback(() => {
        const next: Record<string, 'light' | 'dark' | 'system'> = {
            light: 'dark',
            dark: 'system',
            system: 'light',
        };
        updateAppearance(next[appearance]);
    }, [appearance, updateAppearance]);

    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed((c) => !c);
    }, []);

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex min-h-screen w-full dark:bg-background">
                <AppSidebar collapsed={sidebarCollapsed} />
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-ocean-aqua/40 bg-white/80 px-4 backdrop-blur-md md:px-6 dark:border-sidebar-border dark:bg-background/80">
                        {/* Sidebar toggle */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleSidebar}
                                    aria-label={
                                        sidebarCollapsed
                                            ? 'Ouvrir la barre latérale'
                                            : 'Fermer la barre latérale'
                                    }
                                    className="hidden h-9 w-9 shrink-0 text-slate-500 hover:bg-ocean-aqua/30 hover:text-ocean-deep lg:inline-flex"
                                >
                                    {sidebarCollapsed ? (
                                        <PanelLeftOpen className="h-4 w-4" />
                                    ) : (
                                        <PanelLeftClose className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>
                                    {sidebarCollapsed ? 'Ouvrir' : 'Fermer'} la
                                    barre latérale
                                </p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Breadcrumbs */}
                        <div className="flex min-w-0 flex-1 items-center">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>

                        {/* Search */}
                        <div className="relative hidden sm:block">
                            <Search
                                className={cn(
                                    'pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 transition-colors',
                                    searchFocused
                                        ? 'text-ocean-teal'
                                        : 'text-ocean-teal/50',
                                )}
                            />
                            <Input
                                placeholder="Rechercher un patient..."
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className={cn(
                                    'h-9 w-48 rounded-lg border-ocean-aqua/60 bg-ocean-sand/50 pl-8 text-sm transition-all duration-200 focus:w-72',
                                    'placeholder:text-slate-400',
                                    searchFocused &&
                                        'border-ocean-teal ring-2 ring-ocean-teal/20',
                                )}
                            />
                        </div>

                        {/* Quick actions */}
                        <div className="flex items-center gap-1.5">
                            {/* Nouveau patient */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-slate-500 hover:bg-ocean-aqua/30 hover:text-ocean-deep"
                                        asChild
                                    >
                                        <Link href={patients.create().url}>
                                            <Plus className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Nouveau patient</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Notifications */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative h-9 w-9 text-slate-500 hover:bg-ocean-coral/10 hover:text-ocean-coral"
                                    >
                                        <Bell className="h-4 w-4" />
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ocean-coral/60" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-ocean-coral" />
                                        </span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Notifications</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Theme toggle */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={cycleAppearance}
                                        className="h-9 w-9 text-slate-500 hover:bg-ocean-teal/10 hover:text-ocean-teal"
                                    >
                                        {resolvedAppearance === 'dark' ? (
                                            <Moon className="h-4 w-4" />
                                        ) : (
                                            <Sun className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>
                                        {appearance === 'dark'
                                            ? 'Mode sombre'
                                            : appearance === 'light'
                                              ? 'Mode clair'
                                              : 'Mode système'}{' '}
                                        · Cliquer pour changer
                                    </p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Full screen */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleFullscreen}
                                        className="h-9 w-9 text-slate-500 hover:bg-ocean-aqua/30 hover:text-ocean-deep"
                                    >
                                        {isFullscreen ? (
                                            <Minimize className="h-4 w-4" />
                                        ) : (
                                            <Maximize className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>
                                        {isFullscreen
                                            ? 'Quitter le plein écran'
                                            : 'Plein écran'}
                                    </p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Language */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-slate-500 hover:bg-ocean-aqua/30 hover:text-ocean-deep"
                                    >
                                        <Languages className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>FR · Français</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Separator */}
                        <div className="mx-1 hidden h-6 w-px bg-ocean-aqua/40 md:block" />

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-ocean-aqua/30"
                                >
                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-ocean-aqua/50">
                                        <AvatarImage
                                            src={auth?.user?.avatar}
                                            alt={auth?.user?.name}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-ocean-teal to-ocean-deep text-xs font-medium text-white">
                                            {getInitials(
                                                auth?.user?.name ?? '',
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-sm font-medium text-ocean-deep md:inline dark:text-sidebar-foreground">
                                        {auth?.user?.name}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth?.user && (
                                    <UserMenuContent user={auth.user as any} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </header>
                    <main className="flex-1 overflow-x-hidden">{children}</main>
                </div>
            </div>
        </TooltipProvider>
    );
}

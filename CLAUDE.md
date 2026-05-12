# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Backend**: Laravel 13 (PHP 8.3+), Inertia.js v3, Fortify
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui (New York style), Radix UI
- **Build**: Vite 8, pnpm
- **Testing**: PHPUnit 12
- **Fonts**: Instrument Sans (via Bunny Fonts, configured in vite.config.ts)

## Commands

### Development

```bash
composer run dev          # Start full dev stack (Laravel + queue + logs + Vite)
npm run dev               # Start Vite dev server only
```

### Building

```bash
npm run build             # Production build
npm run build:ssr         # SSR build
```

### Linting & Formatting

```bash
# PHP (Laravel Pint)
composer run lint         # Run Pint (auto-fix)
composer run lint:check   # Run Pint (check only)

# TypeScript/React
npm run lint              # ESLint (auto-fix)
npm run lint:check        # ESLint (check only)
npm run format            # Prettier (auto-fix)
npm run format:check      # Prettier (check only)
npm run types:check       # TypeScript type checking
```

### Testing

```bash
composer run test         # Full test suite (config clear + lint + PHPUnit)

# Run specific tests
vendor/bin/phpunit tests/Feature/DashboardTest.php
vendor/bin/phpunit --filter test_method_name
vendor/bin/phpunit --testsuite Unit
vendor/bin/phpunit --testsuite Feature
```

## Architecture

### Request Flow

Laravel routes (`routes/`) return Inertia responses that render React pages. There are no traditional API endpoints — Inertia bridges server-side routing with client-side React rendering.

### Key Directories

```
app/
  Actions/Fortify/        # Fortify authentication actions
  Concerns/               # Reusable PHP traits
  Http/Controllers/       # Controllers (namespaced by domain, e.g., Settings/)
  Http/Middleware/        # Middleware (HandleInertiaRequests.php configures shared data)
  Http/Requests/         # Form request validation classes
  Models/                 # Eloquent models

resources/js/
  actions/                # Auto-generated TypeScript action helpers (DO NOT MODIFY)
  components/
    ui/                   # shadcn/ui primitives (DO NOT MODIFY)
  hooks/                  # Custom React hooks (e.g., use-appearance.ts)
  layouts/                # Inertia page layouts (app-layout, auth-layout, settings/layout)
  lib/                    # Utilities (cn helper, etc.)
  pages/                  # Inertia pages (route-matched by name)
  routes/                 # Auto-generated Wayfinder route helpers (DO NOT MODIFY)
  wayfinder/              # Auto-generated type-safe route definitions (DO NOT MODIFY)

routes/
  web.php                 # Public and auth-protected routes
  settings.php            # Settings-related routes
  console.php             # Artisan console routes
```

### Routing Pattern

- Use `Route::inertia()` for pages that don't need controller logic
- Use controller classes in `app/Http/Controllers/` (namespaced by domain)
- Route names use kebab-case (e.g., `profile.edit`, `security.edit`)
- Wayfinder auto-generates type-safe route helpers accessible via `@/routes`

### Inertia Layout Resolution

The app uses a custom layout resolver in `resources/js/app.tsx`:
- `welcome` page → no layout
- `auth/*` pages → `AuthLayout`
- `settings/*` pages → `[AppLayout, SettingsLayout]`
- All others → `AppLayout`

### Authorization

- User roles are stored in `users.role`: `admin`, `medecin`, `secretaire` (see migration `2026_05_07_100000_add_role_to_users_table.php`)
- Policies live in `app/Policies/` and are **auto-discovered** (no manual registration) — class name must match `App\Policies\{Model}Policy`
- Controllers call `$this->authorize('action', $modelOrClass)`; the base `Controller` already uses `AuthorizesRequests`
- Field-level authorization on update is done at the controller level (see `PatientController::filterFieldsForRole`), while the policy only authorizes the *action*. Roles often have different writable column sets — keep that filter pattern when adding similar resources.

### Sidebar Navigation

The sidebar is two layers:
- `components/medical-sidebar.tsx` — pure UI; nav items are keyed by string (`dashboard`, `patients`, `prescriptions`, …) in `PRIMARY_NAV` / `EMERGENCY_NAV`
- `components/app-sidebar.tsx` — wires those keys to URLs via `ROUTE_MAP` (using Wayfinder helpers) and computes `activeKey` from `usePage().url`

To add an entry: add `{ key, label, icon }` to the relevant section in `medical-sidebar.tsx`, then add `key: routeHelper.index().url` to `ROUTE_MAP` and extend the `activeKey` URL-prefix matching in `app-sidebar.tsx`.

### PDF Generation

- Uses `barryvdh/laravel-dompdf` — facade `Barryvdh\DomPDF\Facade\Pdf`
- Blade templates live in `resources/views/pdf/`
- Pattern: `Pdf::loadView('pdf.xxx', [...])->setPaper('a5', 'portrait')->stream($filename)`
- Use inline CSS, `DejaVu Sans` for Unicode glyphs, and `position: fixed` for headers/footers

### Flash messages / toasts

Controllers attach toast data via session flash on the redirect:
```php
return to_route('xxx.show', $model)
    ->with('toast', ['type' => 'success', 'message' => '...']);
```
`back()->with('toast', ...)` works the same way. The frontend renders these via `sonner` (`<Toaster />` in `app.tsx`) reading shared Inertia props.

### Dates / Carbon

`AppServiceProvider` calls `Date::use(CarbonImmutable::class)`. All date-cast model attributes return `CarbonImmutable`. When parsing user input, use `Carbon::parse(...)` (returns mutable) or `CarbonImmutable::parse(...)` deliberately — don't rely on `$model->date_field` being mutable.

### React 19 + React Compiler

This project uses React 19 with the React Compiler (babel-plugin-react-compiler). Do not use `useMemo` or `useCallback` — the compiler handles optimization automatically.

## Code Style

### TypeScript/React

- **Imports**: Use `type` imports for types (`import type { Foo }`). Prefer top-level type specifiers
- **Import order**: Built-in → External → Internal (`@/`) → Parent → Sibling → Index (alphabetical, case-insensitive)
- **Path alias**: `@/` maps to `resources/js/` (e.g., `import { cn } from "@/lib/utils"`)
- **Naming**: `camelCase` for functions/variables, `PascalCase` for components/types, `kebab-case` for filenames
- **Components**: Use `function` declarations, not arrow functions
- **Classes**: Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- **Variants**: Use `cva` (class-variance-authority) for component variants
- **Quotes**: Single quotes, semicolons required, 4-space tabs, 80-char print width

### PHP

- **Preset**: Laravel Pint (Laravel style)
- **Naming**: `camelCase` for methods/variables, `PascalCase` for classes
- **Controllers**: Extend `App\Http\Controllers\Controller`; use typed properties (PHP 8.3+)
- **Models**: Use `#[Fillable]` and `#[Hidden]` attributes instead of protected properties
- **Requests**: Form request classes in `app/Http/Requests/` for validation
- **Flash messages**: Use `Inertia::flash('toast', {...})` for notifications
- **Redirects**: Use `to_route()` helper for redirects by route name

## Important Notes

- **Do not modify** files in `resources/js/components/ui/*`, `resources/js/routes/**`, `resources/js/wayfinder/**`, or `resources/js/actions/**` — these are auto-generated
- ESLint ignores: `vendor`, `node_modules`, `public`, `bootstrap/ssr`, `resources/js/actions/**`, `resources/js/components/ui/*`, `resources/js/routes/**`, `resources/js/wayfinder/**`
- Wayfinder generates type-safe route/action helpers — use these instead of hardcoding URLs
- Database: SQLite in-memory for testing (configured in phpunit.xml), configure `.env` for local development
- Toast notifications: Use `sonner` via `<Toaster />` in app.tsx

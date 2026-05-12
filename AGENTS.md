# AGENTS.md

## Project

Medical clinic management system (GCM = Gestion Cabinet Médical). Built on the Laravel React starter kit with Inertia.js — **no REST API**, all pages are server-rendered via Inertia.

## Tech Stack

- **Backend**: Laravel 13 (PHP 8.3+), Inertia.js v3, Fortify, Wayfinder, dompdf
- **Frontend**: React 19, TypeScript, Tailwind CSS v4 (Ocean Breeze theme), shadcn/ui (New York), sonner (toasts)
- **Build**: Vite 8, pnpm

## Domain

- **Patient** — soft deletes, UUID, `dossier_number` (`DOS-YYYY-NNNNNN`), linked to a `medecin` (User)
- **Prescription** — soft deletes, UUID, `numero_ordonnance` (`ORD-YYYY-NNNNN`), has ordered `PrescriptionLigne` items
- **MedicamentFavori** — per-doctor favorites tracked by `usage_count`
- **User roles** — `admin`, `medecin`, `secretaire`; authorization via policies (`PatientPolicy`, `PrescriptionPolicy`)
- **PDF** — dompdf renders `resources/views/pdf/ordonnance.blade.php` at A5 portrait
- **Theme** — Ocean Breeze palette (`ocean-deep`, `ocean-teal`, `ocean-aqua`, `ocean-seafoam`, `ocean-sand`, `ocean-coral`) defined in `resources/css/app.css`
- **Clinic config** — `config/clinique.php` reads `CLINIQUE_NOM`, `CLINIQUE_ADRESSE`, `CLINIQUE_TELEPHONE` from env

## Commands

```bash
composer run setup         # Full setup: composer install → .env → key:generate → migrate → npm i → build
composer run dev           # Full dev stack (Laravel + queue + logs + Vite via concurrently)
npm run dev                # Vite dev server only
npm run build              # Production build (Vite)
npm run build:ssr          # SSR build
composer run lint          # Pint auto-fix
composer run lint:check    # Pint check only
npm run lint               # ESLint auto-fix
npm run lint:check         # ESLint check only
npm run format             # Prettier auto-fix
npm run format:check       # Prettier check only
npm run types:check        # tsc --noEmit
composer run test          # Full: config:clear → lint → PHPUnit
composer run ci:check      # CI: lint → format → types → test
vendor/bin/phpunit --filter test_method_name
```

## Conventions

### Auto-generated (do not modify)
`resources/js/components/ui/*`, `resources/js/routes/**`, `resources/js/wayfinder/**`, `resources/js/actions/**`

### Routing
- `Route::inertia()` for pages without controller logic
- Controllers namespaced by domain (`Settings/`, etc.)
- Route names use kebab-case
- Wayfinger generates type-safe helpers: `to_route()` (PHP) / `@/routes` (TS)
- Breadcrumbs passed as page prop from every controller

### Auth
- Fortify: login, registration, password reset, email verification, 2FA
- Home after auth: `/dashboard`
- Tests use SQLite `:memory:` (see `phpunit.xml` for all test env vars)

### Layout resolution (`resources/js/app.tsx`)
| Page pattern | Layout |
|---|---|
| `welcome` | none |
| `auth/*` | `AuthLayout` |
| `settings/*` | `[AppLayout, SettingsLayout]` |
| everything else | `AppLayout` |

### React / TypeScript
- React Compiler enabled — **do not use `useMemo`/`useCallback`**
- `function` declarations for components, not arrow functions
- `@/` maps to `resources/js/`
- `cn()` from `@/lib/utils` for conditional classes
- `cva` for component variants

### PHP
- `#[Fillable]` / `#[Hidden]` attributes on models (not protected properties)
- Form Request classes in `app/Http/Requests/` for validation
- API Resources in `app/Http/Resources/` for serialization
- Flash: `Inertia::flash('toast', ['type' => 'success', 'message' => '...'])`

## Quirks
- `.npmrc` sets `ignore-scripts=true` — npm lifecycle scripts skip on install
- `pnpm-workspace.yaml` hoists `@inertiajs/core` publicly
- SSR enabled at `http://127.0.0.1:13714` (`config/inertia.php`)
- Soft deletes on Patient and Prescription — factor into queries

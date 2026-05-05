# AGENTS.md - Repository Guidelines

## Tech Stack

- **Backend**: Laravel 13 (PHP 8.3+), Inertia.js, Fortify
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI
- **Build**: Vite, pnpm workspaces
- **Testing**: PHPUnit

## Commands

### Development

```bash
composer run dev          # Start dev server (Laravel + queue + logs + Vite)
npm run dev               # Start Vite dev server only
```

### Building

```bash
npm run build             # Production build
npm run build:ssr         # SSR build
```

### Linting & Formatting

```bash
# PHP
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

# Run a single PHPUnit test file
vendor/bin/phpunit tests/Feature/DashboardTest.php

# Run a single test method (filter by name)
vendor/bin/phpunit --filter test_authenticated_users_can_visit_the_dashboard

# Run only Unit or Feature tests
vendor/bin/phpunit --testsuite Unit
vendor/bin/phpunit --testsuite Feature
```

## Code Style

### TypeScript/React

- **Imports**: Use `type` imports for types only (`import type { Foo }`). Prefer top-level type specifiers
- **Import order**: Built-in → External → Internal (`@/`) → Parent → Sibling → Index (alphabetical, case-insensitive)
- **Path alias**: Use `@/` for `resources/js/` (e.g., `import { cn } from "@/lib/utils"`)
- **Naming**: `camelCase` for functions/variables, `PascalCase` for components/types, `kebab-case` for filenames
- **React 19**: Uses React Compiler (babel-plugin-react-compiler); no `useMemo`/`useCallback` needed
- **Components**: Use `function` declarations, not arrow functions
- **Classes**: Use `cn()` utility from `@/lib/utils` for conditional Tailwind classes
- **Variants**: Use `cva` (class-variance-authority) for component variants
- **Curly braces**: Required on all control flow (`curly: ['error', 'all']`)
- **Brace style**: 1tbs (K&R style)
- **Blank lines**: Required around control statements (`if`, `return`, `for`, `while`, `try`, etc.)
- **Quotes**: Single quotes, semicolons required, 4-space tabs, 80-char print width
- **Explicit `any`**: Allowed (`@typescript-eslint/no-explicit-any` is off)

### PHP

- **Preset**: Laravel Pint (Laravel style)
- **Naming**: `camelCase` for methods/variables, `PascalCase` for classes
- **Controllers**: Extend `App\Http\Controllers\Controller`; use typed request/responses
- **Models**: Use `#[Fillable]` and `#[Hidden]` attributes instead of protected properties
- **Type hints**: Use PHP 8.3+ typed properties and return types
- **Requests**: Form request classes for validation, placed in `app/Http/Requests/`
- **Routing**: Use `Route::inertia()` for Inertia pages; route names use kebab-case
- **Flash messages**: Use `Inertia::flash('toast', {...})` for notifications

### Error Handling

- PHP: Use Form Request classes for validation errors; Laravel handles response automatically
- TypeScript: Prefer `unknown` in catch blocks; explicit error handling with Inertia flash messages

## Project Structure

```
app/                          # PHP backend
  Actions/                    # Action classes (e.g., Fortify actions)
  Concerns/                   # Reusable traits
  Http/Controllers/           # Controllers (namespaced by domain)
  Http/Middleware/            # Middleware
  Http/Requests/              # Form request validation
  Models/                     # Eloquent models
resources/js/                 # React frontend
  components/                 # Shared React components
    ui/                       # shadcn/ui primitives (DO NOT MODIFY)
  hooks/                      # Custom React hooks
  layouts/                    # Inertia page layouts
  lib/                        # Utilities (e.g., cn helper)
  pages/                      # Inertia pages (route-matched)
routes/                       # Laravel route definitions
tests/
  Feature/                    # Feature tests
  Unit/                       # Unit tests
```

## Important Notes

- **Do not modify** files in `resources/js/components/ui/*` or `resources/js/routes/**` (auto-generated)
- ESLint ignores: `vendor`, `node_modules`, `public`, `bootstrap/ssr`, `resources/js/actions/**`, `resources/js/components/ui/*`, `resources/js/routes/**`, `resources/js/wayfinder/**`
- Wayfinder auto-generates type-safe route/action helpers at `@/routes`
- Use `to_route()` helper in PHP for redirects by route name

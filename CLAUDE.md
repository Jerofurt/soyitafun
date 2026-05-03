# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`soyitafun` — Portal de Itamambuca (a Brazilian beach town). Next.js 16 App Router + Supabase (auth + Postgres with RLS) + Tailwind v4. UI copy is in Portuguese; keep new user-facing strings in Portuguese to match.

The product surface (per the admin dashboard) is four content domains: **hospedagens, atividades, comércios, serviços**. Only auth + the empty admin shell exist so far (Sprint 1 per `git log`); the domain tables are referenced from queries but the CRUD UI is not yet built.

## Commands

```bash
npm run dev      # next dev — http://localhost:3000
npm run build    # next build
npm start        # next start (after build)
npm run lint     # eslint (config: eslint-config-next core-web-vitals + typescript)
```

No test runner is configured.

`.env.local` must define `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The service-role key is in the env file but is **not** currently consumed by any code — do not import it into client-reachable modules.

## Architecture

### Three Supabase clients — pick the right one

Supabase SSR requires three separate factories because cookie access differs by runtime. They live in `src/lib/supabase/`:

- **`server.ts` → `createClient()`** — async, uses `next/headers` `cookies()`. Use in Server Components, Server Actions, and Route Handlers. The `setAll` is wrapped in `try/catch` because Server Components cannot mutate cookies; that's fine because the middleware refreshes the session on every request.
- **`client.ts` → `createClient()`** — synchronous browser client (`createBrowserClient`). Use only inside `'use client'` components.
- **`middleware.ts` → `updateSession(request)`** — invoked from the root `src/middleware.ts`. Two responsibilities: (1) refresh the auth cookie on every request, (2) gate `/admin/*` (except `/admin/login`) behind a logged-in user, redirecting to `/admin/login` otherwise.

Never call `supabase.auth.getUser()` and trust the result without going through one of these factories — the cookie plumbing is what makes RLS work.

### Auth flow

- Login is a Server Action (`src/app/admin/login/actions.ts` → `login`/`logout`) using `signInWithPassword`. On error it redirects back with `?error=invalid_credentials`; the login page reads the search param and renders the message.
- After login it calls `revalidatePath('/', 'layout')` then redirects to `/admin`. Preserve that pattern for any new auth-state-changing action so cached layouts pick up the new session.
- The admin dashboard reads the `profiles` table (`id, nome, email, role`) keyed by `user.id`. `profiles.role` is the authorization signal — RLS in Supabase is the source of truth for what each role can read/write, so do not duplicate authorization checks in app code unless RLS already permits the read.

### Routing

- App Router under `src/app/`. Path alias `@/*` → `./src/*` (configured in `tsconfig.json`).
- `src/middleware.ts` matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and image extensions. If you add other public asset paths that should skip the auth refresh, extend that matcher rather than adding early-returns inside `updateSession`.

### Styling

Tailwind v4 via `@tailwindcss/postcss` (no `tailwind.config.*` file — config lives in `globals.css` if needed). The current palette uses `stone-*` for neutrals and `emerald-*` for primary actions.

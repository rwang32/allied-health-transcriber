# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

We’re building the app described in @SPEC.md. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture

Keep your replies extremely concise and focus on key info. No unnecessary fluff or long code snippets

@AGENTS.md

## Commands

```bash
pnpm dev        # Start dev server (Turbopack, port 3000)
pnpm build      # Production build (Turbopack)
pnpm start      # Start production server
pnpm lint       # Run ESLint (uses eslint directly — NOT next lint)
```

## Architecture

The target stack is: Next.js 16 App Router, React 19, Tailwind CSS v4, Supabase Auth, Supabase (Postgres + Storage), OpenAI Whisper (transcription), Anthropic Claude (note generation).

**Current state:** `src/` layout is in place. Supabase clients, API routes, and some UI components exist (see below).

**Structure:** `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/types/`.

## Next.js 16 Breaking Changes

This project runs Next.js 16, which has several breaking changes from prior versions:

### `middleware.ts` → `proxy.ts`

The `middleware` filename and export are deprecated. Use `proxy.ts` with `export function proxy(request)` instead. The `edge` runtime is **not** supported in `proxy` — it runs Node.js only.

```ts
// proxy.ts (NOT middleware.ts)
export function proxy(request: Request) { ... }
```

### Async Request APIs (fully breaking)

`cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now **always async** — synchronous access has been fully removed. Always `await` them:

```ts
// Page with dynamic params
export default async function Page({
  params,
}: PageProps<"/sessions/[sessionId]">) {
  const { sessionId } = await params;
  const cookieStore = await cookies();
}
```

Run `npx next typegen` to generate type helpers (`PageProps`, `LayoutProps`, `RouteContext`).

### ESLint flat config

ESLint 9 flat config (`eslint.config.mjs`) is used — no `.eslintrc`. Run `eslint` directly, not `next lint`.

### Other notable changes

- **Turbopack** is the default bundler for both `dev` and `build`. No `--turbopack` flag needed.
- `cacheLife` / `cacheTag` no longer need the `unstable_` prefix — import directly from `next/cache`.
- `experimental.turbopack` config is now top-level `turbopack` in `next.config.ts`.

## Supabase Clients

Three clients in `src/lib/supabase/`:

| File | Factory | When to use |
|------|---------|-------------|
| `client.ts` | `createClient()` | Client components (browser) |
| `server.ts` | `createServerSupabaseClient()` | Server components, Route Handlers, Server Actions — reads `cookies()` |
| `admin.ts` | `createAdminClient()` | Server-only; bypasses RLS via service-role key. **Never import in client components.** |

All route handlers call `supabase.auth.getUser()` and return 401 if no user.

## API Routes

All routes live under `src/app/api/` and use `createServerSupabaseClient`. Errors return `{ error: { message, code } }`.

### `POST /api/sessions`
Creates a session. Body: `{ patientId: string, durationMinutes?: number }`. Sets `status: "recording"`. Returns `201` with the created `Session`.

### `PATCH /api/sessions/[id]`
Updates a session. Body (all optional): `{ audioUrl, status, errorMessage, durationMinutes }`. Returns `{ data: { id } }`.

### `GET /api/patients`
Returns all patients for the authenticated user, ordered by `last_name`.

### `POST /api/patients`
Creates a patient. Body: `{ firstName: string, lastName: string, dateOfBirth?, email?, phone?, notes? }`. Returns `201` with the created `Patient`.

## Tailwind CSS v4

This project uses Tailwind v4 (`@tailwindcss/postcss`). Configuration is **CSS-first** — there is no `tailwind.config.ts`. Theme customization goes in `app/globals.css` using `@theme`.

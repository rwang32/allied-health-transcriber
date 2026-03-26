# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # Start dev server (Turbopack, port 3000)
pnpm build      # Production build (Turbopack)
pnpm start      # Start production server
pnpm lint       # Run ESLint (uses eslint directly — NOT next lint)
```

## Architecture

This is an early-stage scaffold for the Allied Health Transcriber app. Read [SPEC.md](SPEC.md) for the full product spec before writing any feature code. The target stack is: Next.js 16 App Router, React 19, Tailwind CSS v4, Clerk (auth), Supabase (Postgres + Storage), OpenAI Whisper (transcription), Anthropic Claude (note generation).

**Current state:** bare `create-next-app` scaffold. Only `app/layout.tsx`, `app/page.tsx`, and `app/globals.css` exist. All feature code remains to be built.

**Planned structure:** SPEC.md describes a `src/` layout (`src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/types/`). The scaffold currently has `app/` at the root without `src/`. Follow the SPEC directory layout when creating new files.

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
export default async function Page({ params }: PageProps<'/sessions/[sessionId]'>) {
  const { sessionId } = await params
  const cookieStore = await cookies()
}
```

Run `npx next typegen` to generate type helpers (`PageProps`, `LayoutProps`, `RouteContext`).

### ESLint flat config
ESLint 9 flat config (`eslint.config.mjs`) is used — no `.eslintrc`. Run `eslint` directly, not `next lint`.

### Other notable changes
- **Turbopack** is the default bundler for both `dev` and `build`. No `--turbopack` flag needed.
- `cacheLife` / `cacheTag` no longer need the `unstable_` prefix — import directly from `next/cache`.
- `experimental.turbopack` config is now top-level `turbopack` in `next.config.ts`.

## Tailwind CSS v4

This project uses Tailwind v4 (`@tailwindcss/postcss`). Configuration is **CSS-first** — there is no `tailwind.config.ts`. Theme customization goes in `app/globals.css` using `@theme`.

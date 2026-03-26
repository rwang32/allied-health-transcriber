# SPEC.md — Allied Health Transcriber

> This is the single source of truth for the Allied Health Transcriber project.
> All AI-assisted development (Claude Code, Cursor, etc.) should reference this file before generating code.

---

## 1. Project Overview

### What It Is
Allied Health Transcriber is a web application that listens to therapy sessions in real time and automatically generates structured clinical notes. It eliminates the 10–20 minutes practitioners currently spend writing notes after every appointment.

### Who It's For
- Physiotherapists
- Chiropractors
- Registered Massage Therapists (RMTs)
- Other allied health practitioners in clinic settings

### Core Value Proposition
"Your notes are done instantly."

Practitioners record their session in-browser. The app transcribes the audio, separates clinical content from casual conversation, and produces clean, editable notes ready to copy into their existing clinic management system (e.g., Jane App).

### Current Phase
**MVP (Phase 1)** — Record → Transcribe → Generate Notes → Display → Copy

---

## 2. Tech Stack

| Layer             | Technology                        | Notes                                      |
|-------------------|-----------------------------------|--------------------------------------------|
| Framework         | Next.js 14+ (App Router)          | TypeScript, server components by default   |
| UI                | React 18+, Tailwind CSS           | Use shadcn/ui for component primitives     |
| Auth              | Clerk                             | Handles sign-up, sign-in, session, webhook |
| Database          | Supabase (PostgreSQL)             | Row-level security enabled                 |
| File Storage      | Supabase Storage                  | Audio file uploads (buckets)               |
| Transcription     | OpenAI Whisper API                | Model: `whisper-1`                         |
| Note Generation   | Anthropic Claude API              | Model: `claude-sonnet-4-20250514`          |
| Deployment        | Vercel                            | Serverless functions for API routes        |
| Package Manager   | pnpm                              | Preferred over npm/yarn                    |

---

## 3. Architecture

### High-Level Data Flow (MVP)

```text
┌─────────────────────────────────────────────────────┐
│  Practitioner opens session page in browser          │
│                                                      │
│  1. Clicks "Start Recording"                         │
│     → Browser MediaRecorder API captures audio       │
│                                                      │
│  2. Clicks "Stop Recording"                          │
│     → Audio blob uploaded to Supabase Storage        │
│     → POST /api/transcribe (audio file ref)          │
│       → Whisper API returns raw transcript           │
│       → Transcript saved to DB                       │
│                                                      │
│  3. Automatic: generate notes                        │
│     → POST /api/generate-notes (transcript)          │
│       → Claude API returns structured notes          │
│       → Notes saved to DB                            │
│                                                      │
│  4. Practitioner sees notes on screen                │
│     → Can edit notes inline                          │
│     → Can copy to clipboard                          │
│     → Can save edits                                 │
└─────────────────────────────────────────────────────┘
```

### Rendering Strategy
- **Server Components** by default for all pages and layouts
- **Client Components** only when required: audio recorder, interactive forms, real-time UI
- Mark client components explicitly with `"use client"` at the top of the file
- Fetch data in server components, pass down as props where possible

### API Routes
All API routes live under `src/app/api/` and run as Vercel serverless functions.

| Route                      | Method | Purpose                                          |
|----------------------------|--------|--------------------------------------------------|
| `/api/transcribe`          | POST   | Accepts audio file URL, calls Whisper, returns transcript |
| `/api/generate-notes`      | POST   | Accepts transcript text, calls Claude, returns structured notes |
| `/api/webhooks/clerk`      | POST   | Receives Clerk webhook events, syncs user to Supabase |
| `/api/sessions`            | GET    | List sessions for authenticated user             |
| `/api/sessions`            | POST   | Create a new session record                      |
| `/api/sessions/[id]`       | GET    | Get single session with notes                    |
| `/api/sessions/[id]`       | PATCH  | Update session or notes (after editing)          |
| `/api/patients`            | GET    | List patients for authenticated user             |
| `/api/patients`            | POST   | Create a new patient                             |
| `/api/patients/[id]`       | GET    | Get single patient with session history          |

---

## 4. Database Schema

All tables live in Supabase PostgreSQL. Row-level security (RLS) is enabled on every table.

### Tables

```sql
-- Synced from Clerk via webhook
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id      TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  full_name     TEXT,
  clinic_name   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  date_of_birth   DATE,
  email           TEXT,
  phone           TEXT,
  notes           TEXT,                    -- General practitioner notes about patient
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_date    TIMESTAMPTZ DEFAULT now(),
  duration_minutes INTEGER,                -- Actual session duration
  audio_url       TEXT,                    -- Supabase Storage URL
  transcript      TEXT,                    -- Raw Whisper transcript
  status          TEXT DEFAULT 'recording', -- recording | transcribing | generating | complete | error
  error_message   TEXT,                    -- If status is 'error', why
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  clinical_summary  TEXT,                  -- AI-generated clinical content
  edited_summary    TEXT,                  -- Practitioner's edited version (nullable until edited)
  ai_model          TEXT,                  -- Model used for generation (for auditing)
  ai_prompt_version TEXT,                  -- Prompt version used (for iteration tracking)
  confidence_flags  JSONB DEFAULT '[]',    -- Array of flagged items the AI was uncertain about
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);
```

### Row-Level Security Policies
Every table must have RLS policies ensuring:
- Users can only SELECT, INSERT, UPDATE, DELETE their own rows
- Matching is done via `user_id` column against the authenticated Clerk user
- The `users` table matches on `clerk_id`

### Indexes
```sql
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_notes_session_id ON notes(session_id);
```

---

## 5. Authentication Flow

### Clerk Setup
- Clerk handles all authentication UI and session management
- Use `@clerk/nextjs` package
- Wrap the root layout with `<ClerkProvider>`
- Use `middleware.ts` to protect all `(dashboard)` routes

### Middleware (`src/middleware.ts`)
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### User Sync (Clerk → Supabase)
When a user signs up or updates their profile in Clerk:
1. Clerk fires a webhook to `/api/webhooks/clerk`
2. The webhook handler verifies the signature using `CLERK_WEBHOOK_SECRET`
3. Creates or updates the corresponding row in the `users` table
4. This ensures every Clerk user has a matching Supabase row for RLS

---

## 6. Audio Recording

### Browser Recording
- Use the **MediaRecorder API** via a custom `useAudioRecorder` hook
- Audio format: `audio/webm` (best browser support) with fallback to `audio/mp4`
- Sample rate: default (typically 48kHz)
- Record in chunks to allow progress indication

### Hook API (`src/hooks/use-audio-recorder.ts`)
```typescript
interface UseAudioRecorder {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;          // seconds elapsed
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  error: string | null;
}
```

### Session Length Consideration
- Typical sessions are **45–60 minutes**
- Audio at ~128kbps ≈ 40–55 MB per session
- Supabase Storage free tier allows 1GB — plan for paid tier early
- Consider chunked uploads for reliability on slower connections

### Upload Flow
1. Recording stops → audio Blob created
2. Upload Blob to Supabase Storage bucket `session-audio`
3. Store the returned URL in `sessions.audio_url`
4. Trigger transcription

---

## 7. AI Pipeline

### Step 1: Transcription (Whisper)

**Endpoint:** `POST /api/transcribe`

```typescript
// Input
{
  sessionId: string;    // UUID of the session
  audioUrl: string;     // Supabase Storage URL
}

// Process
// 1. Download audio from Supabase Storage
// 2. Send to OpenAI Whisper API
// 3. Save transcript to sessions.transcript
// 4. Update sessions.status to 'generating'
// 5. Return transcript text

// Output
{
  transcript: string;
}
```

**Whisper Configuration:**
- Model: `whisper-1`
- Language: `en`
- Response format: `text`
- For 45–60 min sessions, use chunked audio if file exceeds 25MB (Whisper limit)
  - Split audio into segments server-side if needed
  - Concatenate transcripts in order

### Step 2: Note Generation (Claude)

**Endpoint:** `POST /api/generate-notes`

```typescript
// Input
{
  sessionId: string;
  transcript: string;
  patientContext?: string;  // Optional: previous session notes for context
}

// Process
// 1. Build prompt with transcript + context
// 2. Send to Claude API
// 3. Parse response into structured fields
// 4. Save to notes table
// 5. Update sessions.status to 'complete'

// Output
{
  clinicalSummary: string;
  confidenceFlags: Array<{
    text: string;
    reason: string;  // e.g., "unclear medication name", "ambiguous body region"
  }>;
}
```

**Claude Prompt Design:**

The system prompt must instruct Claude to:
1. Extract only clinically relevant information from the transcript
2. Ignore small talk, greetings, scheduling discussion, and casual conversation
3. Organize the summary clearly with these sections:
   - **Chief Complaint** — Why the patient came in
   - **History** — Relevant background mentioned in conversation
   - **Findings** — What the practitioner observed/assessed
   - **Treatment Provided** — What was done during the session
   - **Patient Response** — How the patient responded to treatment
   - **Recommendations** — Any advice given (exercises, follow-up, etc.)
4. Flag any items where confidence is low (unclear names, ambiguous terms, mumbled sections)
5. Use professional clinical language but keep it readable
6. Do NOT fabricate information — only include what was explicitly said

**Prompt Versioning:**
- Store the prompt version string in `notes.ai_prompt_version`
- This allows A/B testing prompts and tracing note quality back to prompt changes
- Keep prompts in a dedicated file: `src/lib/ai/prompts.ts`

---

## 8. Frontend Pages & Components

### Page Specifications

#### Landing Page (`/`)
- Not behind auth
- Simple hero: headline, subheadline, CTA to sign up
- Brief feature overview
- Placeholder content is fine for MVP

#### Dashboard (`/dashboard`)
- Shows recent sessions (last 10)
- Quick stats: total sessions this week, total patients
- "New Session" prominent CTA button

#### New Session (`/sessions/new`)
- Step 1: Select existing patient or create new patient (inline form)
- Step 2: Audio recorder with:
  - Start/stop/pause controls
  - Live duration timer
  - Audio level indicator (nice-to-have, not required for MVP)
- Step 3: Processing state — show status as it moves through transcribing → generating
- Step 4: Notes display — auto-navigates to session detail page when complete

#### Session Detail (`/sessions/[sessionId]`)
- Left panel: Generated notes with edit capability
- Right panel (or tab): Raw transcript (read-only, for reference)
- Confidence flags highlighted inline (yellow background or similar)
- Actions:
  - "Copy Notes" button → copies clinical summary to clipboard
  - "Save Edits" button → saves to `notes.edited_summary`
  - "Back to Sessions" navigation
- Status indicator if session is still processing

#### Sessions List (`/sessions`)
- Table or card list of all sessions
- Columns: Patient name, date, duration, status
- Click to navigate to session detail
- Search/filter by patient name (nice-to-have for MVP)

#### Patient List (`/patients`)
- Table of all patients
- Click to view patient detail

#### Patient Detail (`/patients/[patientId]`)
- Patient info at top
- List of all sessions for this patient (chronological)
- Click any session to view notes

#### Settings (`/settings`)
- Account info (from Clerk, read-only)
- Clinic name (editable)
- Preferences placeholder for Phase 2

### Component Guidelines
- Use shadcn/ui for all base components (Button, Card, Input, Dialog, Table, Badge, Textarea, Tabs)
- Initialize shadcn/ui with: `npx shadcn-ui@latest init`
- Add components as needed with: `npx shadcn-ui@latest add [component]`
- All components go in `src/components/`
- Shadcn primitives go in `src/components/ui/`
- Feature components are grouped: `src/components/sessions/`, `src/components/patients/`

---

## 9. State Management & Data Fetching

### Server-Side
- Fetch data in **Server Components** using Supabase server client
- Use `async` server components for data loading
- Pass data as props to client components that need interactivity

### Client-Side
- Use **React hooks** (`useState`, `useEffect`, `useReducer`) for local UI state
- Use **custom hooks** for reusable data logic (`use-sessions.ts`, `use-patients.ts`)
- No global state library needed for MVP — keep it simple
- For optimistic updates: use React `useOptimistic` or `useTransition`

### Loading & Error States
- Every page must handle: loading, error, and empty states
- Use Suspense boundaries with fallback components where appropriate
- API errors should show user-friendly messages, never raw error objects

---

## 10. File & Folder Structure

```text
therapy-notes/
├── public/
│   └── images/
│       └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── sessions/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [sessionId]/page.tsx
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [patientId]/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── transcribe/route.ts
│   │       ├── generate-notes/route.ts
│   │       ├── sessions/route.ts
│   │       ├── sessions/[id]/route.ts
│   │       ├── patients/route.ts
│   │       ├── patients/[id]/route.ts
│   │       └── webhooks/clerk/route.ts
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── layout/          # sidebar, header, mobile-nav
│   │   ├── sessions/        # audio-recorder, notes-display, etc.
│   │   └── patients/        # patient-card, patient-form
│   ├── lib/
│   │   ├── supabase/        # client.ts, server.ts, admin.ts
│   │   ├── clerk/           # server.ts
│   │   ├── ai/
│   │   │   ├── transcribe.ts
│   │   │   ├── generate-notes.ts
│   │   │   └── prompts.ts   # All Claude prompts versioned here
│   │   └── utils/
│   │       ├── formatting.ts
│   │       └── constants.ts
│   ├── hooks/
│   │   ├── use-audio-recorder.ts
│   │   ├── use-sessions.ts
│   │   └── use-patients.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── session.ts
│   │   └── patient.ts
│   └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── .env.local
├── .env.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 11. Coding Conventions

### General
- **TypeScript strict mode** enabled — no `any` types unless absolutely necessary
- All functions must have explicit return types
- Use `interface` over `type` for object shapes (unless union types are needed)
- Prefer named exports over default exports (except for Next.js pages)
- Use `async/await` over `.then()` chains
- Handle all errors explicitly — no silent catches

### Naming
- Files: `kebab-case.ts` (e.g., `audio-recorder.tsx`, `generate-notes.ts`)
- Components: `PascalCase` (e.g., `AudioRecorder`, `NotesDisplay`)
- Functions/variables: `camelCase` (e.g., `startRecording`, `sessionData`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_AUDIO_DURATION`)
- Database columns: `snake_case` (e.g., `session_date`, `clinical_summary`)
- Types/Interfaces: `PascalCase` (e.g., `Session`, `PatientFormData`)

### File Structure Per Component
```typescript
// 1. "use client" directive (only if needed)
"use client";

// 2. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 3. Internal imports
import { formatDate } from "@/lib/utils/formatting";

// 4. Types
interface SessionCardProps {
  session: Session;
  onSelect: (id: string) => void;
}

// 5. Component
export function SessionCard({ session, onSelect }: SessionCardProps): JSX.Element {
  // hooks first
  // handlers next
  // render last
  return ( ... );
}
```

### Error Handling Pattern
```typescript
// API routes should return consistent error shapes
interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

// Always return appropriate HTTP status codes
// 200 — success
// 201 — created
// 400 — bad request (missing/invalid params)
// 401 — unauthorized
// 404 — not found
// 500 — internal server error
```

### Import Aliases
Use `@/` path alias pointing to `src/`:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 12. Environment Variables

```bash
# .env.example

# ──── Clerk ────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ──── Supabase ────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ──── OpenAI (Whisper) ────
OPENAI_API_KEY=sk-...

# ──── Anthropic (Claude) ────
ANTHROPIC_API_KEY=sk-ant-...
```

**Rules:**
- Never commit `.env.local` — it is in `.gitignore`
- `NEXT_PUBLIC_` prefixed vars are exposed to the browser — only use for non-secret values
- `SUPABASE_SERVICE_ROLE_KEY` is **never** exposed client-side — server/API routes only
- `CLERK_SECRET_KEY` is server-side only

---

## 13. Security & Privacy

### Healthcare Data Considerations (Canada — PIPEDA & BC PIPA)
This application handles personal health information. Even at MVP, implement these safeguards:

1. **Consent for Recording**
   - Before recording starts, display a consent confirmation: "Has the patient consented to this session being recorded?"
   - Practitioner must check/confirm before the recorder activates
   - Log the consent timestamp in the session record

2. **Data Residency**
   - Supabase project should be hosted in a **Canadian region** if available, or US region as fallback
   - Be aware that Whisper and Claude API calls send data to US-based servers
   - Document this in your privacy policy / terms of service

3. **Encryption**
   - All data in transit: HTTPS enforced (Vercel + Supabase handle this)
   - All data at rest: Supabase encrypts at rest by default
   - Audio files in Supabase Storage: use private buckets (no public URLs)

4. **Access Control**
   - Supabase RLS ensures practitioners only access their own data
   - No shared access between practitioners in MVP (multi-tenant comes later)
   - Audio files served via signed URLs with short expiry (e.g., 1 hour)

5. **Data Retention**
   - Allow practitioners to delete sessions and associated audio/notes
   - Deletion should cascade: session → notes, session → audio file in storage
   - Future: configurable retention policies

6. **Audit Trail**
   - `created_at` and `updated_at` on all tables
   - `ai_model` and `ai_prompt_version` on notes for traceability
   - Future: full audit log table

---

## 14. Session Status State Machine

Sessions move through a defined set of states:

```text
  recording → uploading → transcribing → generating → complete
                                ↘             ↘
                                 → error ←──────
```

| Status        | Meaning                                    | UI Behavior                        |
|---------------|--------------------------------------------|------------------------------------|
| `recording`   | Audio is being captured                    | Show recorder controls             |
| `uploading`   | Audio blob is uploading to Supabase        | Show upload progress               |
| `transcribing`| Audio sent to Whisper, awaiting transcript | Show "Transcribing..." spinner     |
| `generating`  | Transcript sent to Claude, awaiting notes  | Show "Generating notes..." spinner |
| `complete`    | Notes generated and saved                  | Show notes with edit/copy actions  |
| `error`       | Something failed                           | Show error message + retry button  |

- Status transitions happen in the API routes and are saved to `sessions.status`
- The frontend polls or uses real-time subscription to update the UI

---

## 15. Testing Strategy (MVP — Keep It Light)

- **No test framework required for initial MVP**
- Focus on manual testing of the critical path:
  1. Sign up → lands on dashboard
  2. Create patient → appears in list
  3. Start session → record audio → stop
  4. Audio uploads → transcription completes → notes generate
  5. Notes display → editable → copyable → saveable
- When adding tests later:
  - Use **Vitest** for unit tests
  - Use **Playwright** for end-to-end tests
  - Test the AI pipeline with fixture transcripts (known input → expected output shape)

---

## 16. Phase Roadmap

### Phase 1 — MVP (Current)
- [x] Project scaffolding
- [ ] Clerk auth (sign-up, sign-in, middleware, webhook)
- [ ] Supabase schema + RLS policies
- [ ] Patient CRUD
- [ ] Audio recording (in-browser)
- [ ] Audio upload to Supabase Storage
- [ ] Transcription via Whisper API
- [ ] Note generation via Claude API
- [ ] Notes display + edit + copy
- [ ] Session list + detail pages
- [ ] Dashboard with recent sessions
- [ ] Consent confirmation before recording
- [ ] Basic error handling + loading states
- [ ] Deploy to Vercel

### Phase 2 — Structured Documentation
- [ ] SOAP note format (Subjective, Objective, Assessment, Plan)
- [ ] Prompt engineering for SOAP output
- [ ] SOAP notes display + editing
- [ ] Multi-session context (reference previous notes in prompt)

### Phase 3 — Clinical Tools
- [ ] Exercise plan generation
- [ ] Injury tracking per patient
- [ ] Patient timeline view

### Phase 4 — Reports & Insurance
- [ ] Progress reports across sessions
- [ ] Insurance documentation generation
- [ ] PDF export

### Phase 5 — Platform Growth
- [ ] Jane App integration (API)
- [ ] Multi-practitioner clinics (organizations in Clerk)
- [ ] Mobile app (React Native or PWA)
- [ ] Custom prompt templates per practitioner

---

## 17. Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@clerk/nextjs": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.0.0",
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.0.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.0.0",
    "svix": "^1.0.0"
  }
}
```

> Note: Pin exact versions at install time. The caret ranges above are guidance, not final.

---

## 18. Important Reminders for AI-Assisted Development

When generating code for this project:

1. **Always use TypeScript** — no `.js` files in `src/`
2. **Always handle errors** — every `try/catch`, every API response, every Supabase query
3. **Always check auth** — use Clerk's `auth()` helper in API routes and server components
4. **Never expose secrets client-side** — `SUPABASE_SERVICE_ROLE_KEY`, `CLERK_SECRET_KEY`, API keys are server-only
5. **Use the `@/` import alias** — not relative paths like `../../../lib/`
6. **Server Components by default** — only add `"use client"` when state or browser APIs are needed
7. **Keep components focused** — one responsibility per component, extract when complexity grows
8. **Match the database schema exactly** — column names are `snake_case`, TypeScript properties are `camelCase`, convert at the data layer
9. **Follow the status state machine** — sessions must transition through defined states
10. **Consent first** — never allow recording without the consent confirmation step
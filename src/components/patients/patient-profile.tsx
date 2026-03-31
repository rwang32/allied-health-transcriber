"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { PatientEditForm } from "@/components/patients/patient-edit-form";
import type { Patient } from "@/types/patient";
import type { SessionStatus } from "@/types/session";

// ---------- Types ----------

export interface SessionSummary {
  id: string;
  sessionDate: string;
  durationMinutes: number | null;
  status: SessionStatus;
  hasNote: boolean;
  noteSummary: string | null;
  createdAt: string;
}

interface Props {
  initialPatient: Patient;
  sessions: SessionSummary[];
  // TODO: aiSummary?: string | null — pass in once the AI history endpoint is ready
}

// ---------- AI Summary placeholder ----------

function AiSummarySection(/* { aiSummary }: { aiSummary?: string | null } */) {
  // TODO: When AI history summary is ready:
  //   1. Accept `aiSummary?: string | null` prop
  //   2. Fetch from /api/patients/[id]/ai-summary on the server page
  //   3. Render the summary text here instead of the placeholder
  return (
    <section className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">AI History Summary</span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-500">Coming soon</span>
      </div>
      <p className="text-sm text-neutral-400 italic">
        An AI-generated summary of this client&apos;s session history will appear here.
      </p>
    </section>
  );
}

// ---------- Status badge ----------

const STATUS_STYLES: Record<SessionStatus, string> = {
  complete: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  recording: "bg-amber-100 text-amber-800",
  uploading: "bg-amber-100 text-amber-800",
  transcribing: "bg-amber-100 text-amber-800",
  generating: "bg-amber-100 text-amber-800",
};

function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

// ---------- Session row ----------

function SessionRow({ session }: { session: SessionSummary }) {
  const date = new Date(session.sessionDate).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const duration = session.durationMinutes != null ? `${session.durationMinutes} min` : "—";

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-neutral-50 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 group-hover:underline">{date}</p>
        {session.noteSummary && (
          <p className="text-xs text-neutral-500 truncate mt-0.5">{session.noteSummary}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-neutral-400">{duration}</span>
        <StatusBadge status={session.status} />
        {session.hasNote && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Notes</span>
        )}
        <svg className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// ---------- Main component ----------

export function PatientProfile({ initialPatient, sessions }: Props) {
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [editing, setEditing] = useState(false);

  const dob = patient.dateOfBirth
    ? new Date(patient.dateOfBirth).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* AI Summary — reserved for future feature */}
      <AiSummarySection />

      {/* Patient header */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="mt-1 space-y-0.5 text-sm text-neutral-500">
              {dob && <p>DOB: {dob}</p>}
              {patient.email && <p>{patient.email}</p>}
              {patient.phone && <p>{patient.phone}</p>}
            </div>
            {patient.notes && (
              <p className="mt-2 text-sm text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-100">
                {patient.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setEditing((v) => !v)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <Link
              href={`/sessions/new?patientId=${patient.id}`}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 transition-colors"
            >
              New session
            </Link>
          </div>
        </div>

        {editing && (
          <PatientEditForm
            patient={patient}
            onSave={(updated) => {
              setPatient(updated);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        )}
      </section>

      {/* Session history */}
      <section className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">Session history</h2>
          <span className="text-xs text-neutral-400">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
        </div>
        {sessions.length === 0 ? (
          <p className="px-5 py-8 text-sm text-neutral-400 text-center">No sessions yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sessions.map((s) => (
              <li key={s.id}>
                <SessionRow session={s} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

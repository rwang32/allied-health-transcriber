"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Copy,
  Check,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Cake,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Session, Note, SessionStatus } from "@/types/session";
import type { Patient } from "@/types/patient";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionDetailClientProps {
  session: Session;
  patient: Patient;
  note: Note | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ParsedSection {
  heading: string;
  body: string;
}

function parseSections(summary: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const regex = /\*\*([^*]+)\*\*\n([\s\S]*?)(?=\n\*\*|$)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(summary)) !== null) {
    sections.push({ heading: match[1].trim(), body: match[2].trim() });
  }
  // Fallback: if no headings found, return raw text as a single block
  if (sections.length === 0 && summary.trim()) {
    sections.push({ heading: "Clinical Summary", body: summary.trim() });
  }
  return sections;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDob(dob: string | null): string {
  if (!dob) return "—";
  const d = new Date(dob);
  const age = Math.floor(
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
  return `${d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })} (${age} yrs)`;
}

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<SessionStatus, { label: string; className: string }> = {
  recording:  { label: "Recording",   className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
  uploading:  { label: "Uploading",   className: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" },
  transcribing: { label: "Transcribing", className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  generating: { label: "Generating",  className: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  complete:   { label: "Complete",    className: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400" },
  error:      { label: "Error",       className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" },
};

function StatusBadge({ status }: { status: SessionStatus }): React.JSX.Element {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      {label}
    </span>
  );
}

// ── Section Icon ──────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "Chief Complaint":    <span className="text-base">🩺</span>,
  "History":            <span className="text-base">📋</span>,
  "Findings":           <span className="text-base">🔍</span>,
  "Treatment Provided": <span className="text-base">💆</span>,
  "Patient Response":   <span className="text-base">💬</span>,
  "Recommendations":    <span className="text-base">📝</span>,
};

// ── Main Component ────────────────────────────────────────────────────────────

export function SessionDetailClient({
  session,
  patient,
  note,
}: SessionDetailClientProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const displaySummary = note?.editedSummary ?? note?.clinicalSummary ?? null;
  const displaySections = displaySummary ? parseSections(displaySummary) : [];

  async function handleCopy(): Promise<void> {
    const text = displaySummary ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back nav */}
      <Link
        href="/sessions"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        All sessions
      </Link>

      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {patient.firstName} {patient.lastName}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(session.sessionDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(session.sessionDate)}
              {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={session.status} />
          {note && displaySummary && (
            <button
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                copied
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
              )}
            >
              {copied ? (
                <><Check className="h-4 w-4" /> Copied</>
              ) : (
                <><Copy className="h-4 w-4" /> Copy notes</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* ── Notes column ── */}
        <div className="space-y-4">
          {session.status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
              <p className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Session error
              </p>
              {session.errorMessage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {session.errorMessage}
                </p>
              )}
            </div>
          )}

          {note && note.confidenceFlags.length > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-900 dark:bg-yellow-950/40">
              <p className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {note.confidenceFlags.length} item{note.confidenceFlags.length > 1 ? "s" : ""} flagged for review
              </p>
              <ul className="mt-2 space-y-1">
                {note.confidenceFlags.map((flag, i) => (
                  <li key={i} className="text-sm text-yellow-700 dark:text-yellow-400">
                    <span className="font-medium">&ldquo;{flag.text}&rdquo;</span> — {flag.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {displaySections.length > 0 ? (
            <div className="space-y-3">
              {displaySections.map((section) => (
                <NoteSection key={section.heading} section={section} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {session.status === "complete"
                  ? "No notes were generated for this session."
                  : "Notes will appear here once the session is processed."}
              </p>
            </div>
          )}

          {/* Transcript accordion */}
          {session.transcript && (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <button
                onClick={() => setTranscriptOpen((o) => !o)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Raw transcript
                </span>
                {transcriptOpen ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                )}
              </button>
              {transcriptOpen && (
                <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
                  <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {session.transcript}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Patient sidebar ── */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {patient.firstName} {patient.lastName}
                </p>
                <Link
                  href={`/patients/${patient.id}`}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  View patient
                </Link>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 px-4 py-4">
              <SidebarRow icon={<Cake className="h-3.5 w-3.5" />} label="Date of birth" value={formatDob(patient.dateOfBirth)} />
              <SidebarRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={patient.email ?? "—"} />
              <SidebarRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={patient.phone ?? "—"} />
              {patient.notes && (
                <SidebarRow icon={<User className="h-3.5 w-3.5" />} label="Notes" value={patient.notes} multiline />
              )}
            </div>
          </div>

          {/* Session meta */}
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Session info
            </p>
            <div className="space-y-3">
              <SidebarRow icon={<Calendar className="h-3.5 w-3.5" />} label="Date" value={formatDate(session.sessionDate)} />
              <SidebarRow icon={<Clock className="h-3.5 w-3.5" />} label="Duration" value={session.durationMinutes ? `${session.durationMinutes} min` : "—"} />
              {note?.aiModel && (
                <SidebarRow icon={<FileText className="h-3.5 w-3.5" />} label="AI model" value={note.aiModel} />
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Note Section Card ─────────────────────────────────────────────────────────

function NoteSection({ section }: { section: ParsedSection }): React.JSX.Element {
  const icon = SECTION_ICONS[section.heading];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
        {icon && <span className="shrink-0">{icon}</span>}
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {section.heading}
        </h2>
      </div>
      <p className="px-5 py-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
        {section.body}
      </p>
    </div>
  );
}

// ── Sidebar Row ───────────────────────────────────────────────────────────────

function SidebarRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
}): React.JSX.Element {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 shrink-0 text-zinc-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-zinc-400">{label}</p>
        <p className={cn("text-sm text-zinc-700 dark:text-zinc-300", multiline ? "whitespace-pre-line" : "truncate")}>
          {value}
        </p>
      </div>
    </div>
  );
}

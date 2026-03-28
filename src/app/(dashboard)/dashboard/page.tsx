import Link from "next/link";
import {
  CalendarDays,
  Users,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  MOCK_USER,
  getMockRecentSessions,
  getMockSessionsThisWeek,
  getMockTotalPatients,
} from "@/lib/mock-data";
import type { SessionStatus, SessionWithPatient } from "@/types/session";
import { cn } from "@/lib/utils/cn";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  return `${minutes} min`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-6 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {value}
        </p>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: SessionStatus;
}

const STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  recording: {
    label: "Recording",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
    icon: <span className="h-1.5 w-1.5 rounded-full bg-red-500" />,
  },
  uploading: {
    label: "Uploading",
    className:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  transcribing: {
    label: "Transcribing",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  generating: {
    label: "Generating",
    className:
      "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  complete: {
    label: "Complete",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  error: {
    label: "Error",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

interface SessionRowProps {
  session: SessionWithPatient;
}

function SessionRow({ session }: SessionRowProps): React.JSX.Element {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
    >
      {/* Patient avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {session.patientFirstName[0]}
        {session.patientLastName[0]}
      </div>

      {/* Patient name + date */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
          {session.patientFirstName} {session.patientLastName}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatDate(session.sessionDate)}
        </p>
      </div>

      {/* Duration */}
      <div className="hidden items-center gap-1 text-xs text-zinc-500 sm:flex dark:text-zinc-400">
        <Clock className="h-3.5 w-3.5" />
        {formatDuration(session.durationMinutes)}
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge status={session.status} />
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage(): React.JSX.Element {
  const user = MOCK_USER;
  const recentSessions = getMockRecentSessions(10);
  const sessionsThisWeek = getMockSessionsThisWeek();
  const totalPatients = getMockTotalPatients();

  const greeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {greeting()},{" "}
            {user.fullName?.split(" ")[0] ?? user.email}
          </h1>
          {user.clinicName && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {user.clinicName}
            </p>
          )}
        </div>

        <Link
          href="/sessions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusCircle className="h-4 w-4" />
          New Session
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Sessions This Week"
          value={sessionsThisWeek}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Patients"
          value={totalPatients}
        />
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Recent Sessions
          </h2>
          <Link
            href="/sessions"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <CalendarDays className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No sessions yet.{" "}
              <Link
                href="/sessions/new"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Start your first session.
              </Link>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 px-2 py-2 dark:divide-zinc-800">
            {recentSessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

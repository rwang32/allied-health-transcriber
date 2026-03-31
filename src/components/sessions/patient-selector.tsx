"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, UserPlus, ChevronDown, ChevronUp, ExternalLink, CalendarDays } from "lucide-react";
import type { PatientWithLastSession, PatientFormData } from "@/types/patient";
import { cn } from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PatientSelection =
  | { type: "existing"; patient: PatientWithLastSession }
  | { type: "new"; formData: PatientFormData };

interface PatientSelectorProps {
  patients: PatientWithLastSession[];
  onContinue: (selection: PatientSelection) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLastVisit(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const EMPTY_FORM: PatientFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  notes: "",
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface PatientCardProps {
  patient: PatientWithLastSession;
  isSelected: boolean;
  onSelect: () => void;
}

function PatientCard({ patient, isSelected, onSelect }: PatientCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full rounded-xl border p-4 text-left transition-all",
        isSelected
          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-500 dark:bg-blue-950/40"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      )}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-blue-500" />
      )}

      {/* Header row */}
      <div className="mb-2 flex items-center justify-between gap-4 pr-6">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              isSelected
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {patient.firstName[0]}
            {patient.lastName[0]}
          </div>
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {patient.firstName} {patient.lastName}
          </span>
        </div>

        {/* View profile link — stops propagation so it doesn't select the card */}
        <Link
          href={`/patients/${patient.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <ExternalLink className="h-3 w-3" />
          Profile
        </Link>
      </div>

      {/* Last visit */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
        {patient.lastSessionDate ? (
          <span>Last visit: {formatLastVisit(patient.lastSessionDate)}</span>
        ) : (
          <span className="italic">No previous sessions</span>
        )}
      </div>

      {/* Summary snippet */}
      {patient.lastSessionSummary && (
        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {patient.lastSessionSummary}
        </p>
      )}
    </button>
  );
}

// ── New Patient Form ──────────────────────────────────────────────────────────

interface NewPatientFormProps {
  formData: PatientFormData;
  onChange: (data: PatientFormData) => void;
}

function NewPatientForm({ formData, onChange }: NewPatientFormProps): React.JSX.Element {
  const field = (key: keyof PatientFormData) => ({
    value: formData[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...formData, [key]: e.target.value }),
  });

  const inputClass =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";
  const labelClass = "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400";

  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      <div>
        <label className={labelClass}>
          First Name <span className="text-red-500">*</span>
        </label>
        <input className={inputClass} placeholder="Jane" {...field("firstName")} />
      </div>
      <div>
        <label className={labelClass}>
          Last Name <span className="text-red-500">*</span>
        </label>
        <input className={inputClass} placeholder="Smith" {...field("lastName")} />
      </div>
      <div>
        <label className={labelClass}>Date of Birth</label>
        <input type="date" className={inputClass} {...field("dateOfBirth")} />
      </div>
      <div>
        <label className={labelClass}>Phone</label>
        <input className={inputClass} placeholder="604-555-0100" {...field("phone")} />
      </div>
      <div className="col-span-2">
        <label className={labelClass}>Email</label>
        <input
          type="email"
          className={inputClass}
          placeholder="jane@email.com"
          {...field("email")}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PatientSelector({ patients, onContinue }: PatientSelectorProps): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientWithLastSession | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState<PatientFormData>(EMPTY_FORM);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q)
    );
  });

  const newPatientValid =
    newPatientData.firstName.trim().length > 0 &&
    newPatientData.lastName.trim().length > 0;

  const canContinue = showNewForm ? newPatientValid : selectedPatient !== null;

  const handleContinue = (): void => {
    if (showNewForm && newPatientValid) {
      onContinue({ type: "new", formData: newPatientData });
    } else if (!showNewForm && selectedPatient) {
      onContinue({ type: "existing", patient: selectedPatient });
    }
  };

  const toggleNewForm = (): void => {
    setShowNewForm((v) => !v);
    if (!showNewForm) setSelectedPatient(null);
  };

  const handleSelectPatient = (p: PatientWithLastSession): void => {
    setSelectedPatient(p);
    setShowNewForm(false);
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Search patients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      {/* Patient list */}
      <div className="mb-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400">
            No patients match &ldquo;{search}&rdquo;
          </p>
        ) : (
          filtered.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              isSelected={selectedPatient?.id === p.id}
              onSelect={() => handleSelectPatient(p)}
            />
          ))
        )}
      </div>

      {/* New patient toggle */}
      <button
        type="button"
        onClick={toggleNewForm}
        className={cn(
          "mb-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
          showNewForm
            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
            : "border-dashed border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
        )}
      >
        <span className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add new patient
        </span>
        {showNewForm ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {showNewForm && (
        <NewPatientForm formData={newPatientData} onChange={setNewPatientData} />
      )}

      {/* Continue */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!canContinue}
        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}

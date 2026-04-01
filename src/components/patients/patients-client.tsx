"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PatientEditForm } from "@/components/patients/patient-edit-form";
import type { Patient, PatientFormData } from "@/types/patient";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

type SortKey = "name" | "createdAt";
type SortDir = "asc" | "desc";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDob(dob: string | null): string {
  if (!dob) return "—";
  return new Date(dob).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

// ── Add Patient Modal ─────────────────────────────────────────────────────────

interface AddPatientModalProps {
  onAdd: (patient: Patient) => void;
  onClose: () => void;
}

function AddPatientModal({ onAdd, onClose }: AddPatientModalProps): React.JSX.Element {
  const [fields, setFields] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!fields.firstName.trim() || !fields.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const json = (await res.json()) as {
        data?: Patient;
        error?: { message: string };
      };
      if (!res.ok || json.error) {
        setError(json.error?.message ?? "Failed to create patient.");
        return;
      }
      onAdd(json.data!);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Add New Patient
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="First name"
              name="firstName"
              value={fields.firstName}
              onChange={handleChange}
              required
            />
            <FormField
              label="Last name"
              name="lastName"
              value={fields.lastName}
              onChange={handleChange}
              required
            />
            <FormField
              label="Date of birth"
              name="dateOfBirth"
              type="date"
              value={fields.dateOfBirth}
              onChange={handleChange}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={fields.email}
              onChange={handleChange}
            />
            <FormField
              label="Phone"
              name="phone"
              type="tel"
              value={fields.phone}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Notes
            </label>
            <textarea
              name="notes"
              value={fields.notes}
              onChange={handleChange}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Patient Modal ────────────────────────────────────────────────────────

interface EditPatientModalProps {
  patient: Patient;
  onSave: (updated: Patient) => void;
  onClose: () => void;
}

function EditPatientModal({
  patient,
  onSave,
  onClose,
}: EditPatientModalProps): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Edit Patient
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <PatientEditForm
            patient={patient}
            onSave={(updated) => {
              onSave(updated);
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────────────────────

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={`add-${name}`}
        className="text-xs font-medium uppercase tracking-wide text-zinc-500"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        id={`add-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
      />
    </div>
  );
}

// ── Sort Button ───────────────────────────────────────────────────────────────

function SortButton({
  label,
  sortKey,
  currentKey,
  currentDir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onClick: () => void;
}): React.JSX.Element {
  const active = currentKey === sortKey;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
    >
      {label}
      {active ? (
        currentDir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface PatientsClientProps {
  initialPatients: Patient[];
}

export function PatientsClient({
  initialPatients,
}: PatientsClientProps): React.JSX.Element {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Derived state ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q),
    );
  }, [patients, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp =
          `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`,
          );
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSort(key: SortKey): void {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setSearch(e.target.value);
    setPage(1);
  }

  const handleAdd = useCallback((patient: Patient): void => {
    setPatients((prev) => [patient, ...prev]);
    setShowAddModal(false);
  }, []);

  const handleEdit = useCallback((updated: Patient): void => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
    setEditingPatient(null);
  }, []);

  async function handleDelete(id: string): Promise<void> {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const json = (await res.json().catch(() => ({}))) as {
          error?: { message: string };
        };
        setDeleteError(json.error?.message ?? "Failed to delete patient.");
        setDeletingId(null);
        return;
      }
      setPatients((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Page container */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Patients
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {patients.length} patient{patients.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4" />
            Add patient
          </button>
        </div>

        {/* Search & sort bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search patients…"
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="hidden sm:inline">Sort:</span>
            <SortButton
              label="Name"
              sortKey="name"
              currentKey={sortKey}
              currentDir={sortDir}
              onClick={() => handleSort("name")}
            />
            <SortButton
              label="Date added"
              sortKey="createdAt"
              currentKey={sortKey}
              currentDir={sortDir}
              onClick={() => handleSort("createdAt")}
            />
          </div>
        </div>

        {/* Patient list */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <User className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {search
                  ? `No patients match "${search}"`
                  : "No patients yet. Add your first patient to get started."}
              </p>
              {!search && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Add patient
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden border-b border-zinc-100 px-6 py-3 dark:border-zinc-800 sm:grid sm:grid-cols-[1fr_1fr_1fr_auto] sm:gap-4">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Patient
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Contact
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Date of birth
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Actions
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {paginated.map((patient) => (
                  <PatientRow
                    key={patient.id}
                    patient={patient}
                    isDeleteConfirm={deleteConfirmId === patient.id}
                    isDeleting={deletingId === patient.id}
                    deleteError={deleteConfirmId === patient.id ? deleteError : null}
                    onEdit={() => { setEditingPatient(patient); setDeleteConfirmId(null); }}
                    onDeleteRequest={() => { setDeleteConfirmId(patient.id); setDeleteError(null); }}
                    onDeleteConfirm={() => handleDelete(patient.id)}
                    onDeleteCancel={() => { setDeleteConfirmId(null); setDeleteError(null); }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, sorted.length)} of{" "}
                    {sorted.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPatientModal
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onSave={handleEdit}
          onClose={() => setEditingPatient(null)}
        />
      )}
    </>
  );
}

// ── Patient Row ───────────────────────────────────────────────────────────────

interface PatientRowProps {
  patient: Patient;
  isDeleteConfirm: boolean;
  isDeleting: boolean;
  deleteError: string | null;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function PatientRow({
  patient,
  isDeleteConfirm,
  isDeleting,
  deleteError,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: PatientRowProps): React.JSX.Element {
  return (
    <div className="px-4 py-3 sm:px-6">
      {/* Main row content */}
      <div className="flex items-center gap-4 sm:grid sm:grid-cols-[1fr_1fr_1fr_auto]">
        {/* Patient name */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {getInitials(patient.firstName, patient.lastName)}
          </div>
          <div className="min-w-0">
            <Link
              href={`/patients/${patient.id}`}
              className="truncate text-sm font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-50 dark:hover:text-blue-400"
            >
              {patient.firstName} {patient.lastName}
            </Link>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Added {formatDate(patient.createdAt)}
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="hidden min-w-0 sm:block">
          {patient.email ? (
            <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
              {patient.email}
            </p>
          ) : null}
          {patient.phone ? (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {patient.phone}
            </p>
          ) : null}
          {!patient.email && !patient.phone && (
            <span className="text-sm text-zinc-300 dark:text-zinc-600">—</span>
          )}
        </div>

        {/* DOB */}
        <div className="hidden sm:block">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatDob(patient.dateOfBirth)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onEdit}
            title="Edit patient"
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDeleteRequest}
            title="Delete patient"
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {isDeleteConfirm && (
        <div
          className={cn(
            "mt-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/40",
          )}
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Delete {patient.firstName} {patient.lastName}?
          </p>
          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
            This will permanently remove the patient and all their sessions.
          </p>
          {deleteError && (
            <p className="mt-1.5 text-xs text-red-700 dark:text-red-300">
              {deleteError}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onDeleteConfirm}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={onDeleteCancel}
              disabled={isDeleting}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-transparent dark:text-red-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

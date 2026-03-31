"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Patient } from "@/types/patient";

interface Props {
  patient: Patient;
  onSave: (updated: Patient) => void;
  onCancel: () => void;
}

export function PatientEditForm({ patient, onSave, onCancel }: Props) {
  const [fields, setFields] = useState({
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth ?? "",
    email: patient.email ?? "",
    phone: patient.phone ?? "",
    notes: patient.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.firstName.trim() || !fields.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const json = (await res.json()) as { data?: Patient; error?: { message: string } };
      if (!res.ok || json.error) {
        setError(json.error?.message ?? "Failed to save changes.");
        return;
      }
      onSave(json.data!);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-neutral-200 rounded-xl p-5 space-y-4 bg-neutral-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" name="firstName" value={fields.firstName} onChange={handleChange} required />
        <Field label="Last name" name="lastName" value={fields.lastName} onChange={handleChange} required />
        <Field label="Date of birth" name="dateOfBirth" type="date" value={fields.dateOfBirth} onChange={handleChange} />
        <Field label="Email" name="email" type="email" value={fields.email} onChange={handleChange} />
        <Field label="Phone" name="phone" type="tel" value={fields.phone} onChange={handleChange} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Notes</label>
        <textarea
          name="notes"
          value={fields.notes}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 disabled:opacity-50 transition-colors",
          )}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
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
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />
    </div>
  );
}

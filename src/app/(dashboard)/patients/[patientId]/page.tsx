import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PatientProfile } from "@/components/patients/patient-profile";
import type { PatientRow, SessionRow, NoteRow } from "@/types/database";
import type { Patient } from "@/types/patient";
import type { SessionSummary } from "@/components/patients/patient-profile";

// TODO: remove once auth is wired up
const DEV_USER_ID = "e9b2ef86-6e8a-41d7-b7bc-88b0f1f82e70";

interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { patientId } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = user ? supabase : createAdminClient();
  const userId = user?.id ?? DEV_USER_ID;

  // Fetch patient + sessions in parallel.
  // Sessions select omits heavy transcript/audio_url columns for performance.
  const [patientResult, sessionsResult] = await Promise.all([
    db
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .eq("user_id", userId)
      .single(),
    db
      .from("sessions")
      .select("id, session_date, duration_minutes, status, error_message, created_at, notes(id, clinical_summary, edited_summary)")
      .eq("patient_id", patientId)
      .eq("user_id", userId)
      .order("session_date", { ascending: false }),
  ]);

  if (patientResult.error || !patientResult.data) {
    notFound();
  }

  const row = patientResult.data as PatientRow;
  const patient: Patient = {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const sessionRows = (sessionsResult.data ?? []) as (SessionRow & {
    notes: Pick<NoteRow, "id" | "clinical_summary" | "edited_summary"> | Pick<NoteRow, "id" | "clinical_summary" | "edited_summary">[] | null;
  })[];

  const sessions: SessionSummary[] = sessionRows.map((s) => {
    const noteData = Array.isArray(s.notes) ? s.notes[0] : s.notes;
    const summary = noteData?.edited_summary ?? noteData?.clinical_summary ?? null;
    return {
      id: s.id,
      sessionDate: s.session_date,
      durationMinutes: s.duration_minutes ?? null,
      status: s.status,
      hasNote: noteData != null,
      noteSummary: summary,
      createdAt: s.created_at,
    };
  });

  return <PatientProfile initialPatient={patient} sessions={sessions} />;
}

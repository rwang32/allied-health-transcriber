import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NewSessionWizard } from "@/components/sessions/new-session-wizard";
import type { PatientWithLastSession } from "@/types/patient";
import type { PatientRow } from "@/types/database";

// TODO: remove DEV_USER_ID once auth is wired up
const DEV_USER_ID = "e9b2ef86-6e8a-41d7-b7bc-88b0f1f82e70";

interface PageProps {
  searchParams: Promise<{ patientId?: string }>;
}

export default async function NewSessionPage({ searchParams }: PageProps): Promise<React.JSX.Element> {
  const { patientId: defaultPatientId } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Use admin client + seed user ID when auth is not yet set up
  const db = user ? supabase : createAdminClient();
  const userId = user?.id ?? DEV_USER_ID;

  // Fetch patients
  const { data: patientRows, error: patientsError } = await db
    .from("patients")
    .select("*")
    .eq("user_id", userId)
    .order("last_name");

  if (patientsError) {
    throw new Error(patientsError.message);
  }

  // Fetch most recent complete sessions (for "last visit" display)
  const { data: sessionRows } = await db
    .from("sessions")
    .select("id, patient_id, session_date, notes(clinical_summary)")
    .eq("user_id", userId)
    .eq("status", "complete")
    .order("session_date", { ascending: false });

  // Build patientId → latest session map
  const latestByPatient = new Map<string, { sessionDate: string; summary: string | null }>();
  for (const s of sessionRows ?? []) {
    if (!latestByPatient.has(s.patient_id as string)) {
      const noteData = s.notes;
      const note = Array.isArray(noteData) ? noteData[0] : noteData;
      latestByPatient.set(s.patient_id as string, {
        sessionDate: s.session_date as string,
        summary: (note as { clinical_summary: string | null } | null)?.clinical_summary ?? null,
      });
    }
  }

  const patients: PatientWithLastSession[] = (patientRows as PatientRow[] ?? []).map((row) => {
    const last = latestByPatient.get(row.id);
    return {
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
      lastSessionDate: last?.sessionDate ?? null,
      lastSessionSummary: last?.summary ?? null,
    };
  });

  return <NewSessionWizard patients={patients} defaultPatientId={defaultPatientId} />;
}

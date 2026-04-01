import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SessionDetailClient } from "@/components/sessions/session-detail-client";
import {
  getMockSessionById,
  getMockNoteBySessionId,
  MOCK_PATIENTS,
} from "@/lib/mock-data";
import type { PatientRow, SessionRow, NoteRow } from "@/types/database";
import type { Patient } from "@/types/patient";
import type { Session, Note } from "@/types/session";

// ── Row converters ────────────────────────────────────────────────────────────

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    userId: row.user_id,
    patientId: row.patient_id,
    sessionDate: row.session_date,
    durationMinutes: row.duration_minutes,
    audioUrl: row.audio_url,
    transcript: row.transcript,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToPatient(row: PatientRow): Patient {
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
  };
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    sessionId: row.session_id,
    clinicalSummary: row.clinical_summary,
    editedSummary: row.edited_summary,
    aiModel: row.ai_model,
    aiPromptVersion: row.ai_prompt_version,
    confidenceFlags: row.confidence_flags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { sessionId } = await params;

  // Mock session IDs (e.g. "ses_001") → use local mock data
  if (sessionId.startsWith("ses_")) {
    const session = getMockSessionById(sessionId);
    if (!session) notFound();

    const patient = MOCK_PATIENTS.find((p) => p.id === session.patientId);
    if (!patient) notFound();

    const note = getMockNoteBySessionId(sessionId) ?? null;

    return (
      <SessionDetailClient session={session} patient={patient} note={note} />
    );
  }

  // Real UUID → fetch from Supabase with admin client (bypasses RLS while auth is disabled)
  const supabase = createAdminClient();

  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !sessionData) notFound();

  const session = rowToSession(sessionData as SessionRow);

  // Fetch patient and note in parallel
  const [{ data: patientData }, { data: noteData }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", session.patientId).single(),
    supabase.from("notes").select("*").eq("session_id", sessionId).maybeSingle(),
  ]);

  if (!patientData) notFound();

  const patient = rowToPatient(patientData as PatientRow);
  const note = noteData ? rowToNote(noteData as NoteRow) : null;

  return <SessionDetailClient session={session} patient={patient} note={note} />;
}

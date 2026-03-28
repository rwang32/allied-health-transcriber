// Raw database row types — column names are snake_case, matching Supabase PostgreSQL schema exactly.
// Convert to camelCase at the data layer before passing to components.

export interface UserRow {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  clinic_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type SessionStatus =
  | "recording"
  | "uploading"
  | "transcribing"
  | "generating"
  | "complete"
  | "error";

export interface SessionRow {
  id: string;
  user_id: string;
  patient_id: string;
  session_date: string;
  duration_minutes: number | null;
  audio_url: string | null;
  transcript: string | null;
  status: SessionStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConfidenceFlag {
  text: string;
  reason: string;
}

export interface NoteRow {
  id: string;
  session_id: string;
  clinical_summary: string | null;
  edited_summary: string | null;
  ai_model: string | null;
  ai_prompt_version: string | null;
  confidence_flags: ConfidenceFlag[];
  created_at: string;
  updated_at: string;
}

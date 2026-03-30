// Mock data used in place of real Supabase queries until auth + DB are wired up.
// Replace calls to these with real server-side Supabase queries when ready.

import type { User } from "@/types/user";
import type { Patient, PatientWithLastSession } from "@/types/patient";
import type { Session, SessionWithPatient } from "@/types/session";

export const MOCK_USER: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "sarah.chen@westcoastphysio.ca",
  fullName: "Sarah Chen",
  clinicName: "West Coast Physiotherapy",
  createdAt: "2025-09-01T08:00:00Z",
  updatedAt: "2025-09-01T08:00:00Z",
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "pat_001",
    userId: MOCK_USER.id,
    firstName: "James",
    lastName: "Okonkwo",
    dateOfBirth: "1985-03-14",
    email: "james.okonkwo@email.com",
    phone: "604-555-0101",
    notes: "History of lower back pain. Responds well to soft tissue work.",
    createdAt: "2025-09-05T09:00:00Z",
    updatedAt: "2025-09-05T09:00:00Z",
  },
  {
    id: "pat_002",
    userId: MOCK_USER.id,
    firstName: "Maria",
    lastName: "Reyes",
    dateOfBirth: "1972-11-28",
    email: "m.reyes@email.com",
    phone: "604-555-0102",
    notes: "Post-surgical rehab, right knee ACL repair (Feb 2025).",
    createdAt: "2025-09-10T10:00:00Z",
    updatedAt: "2025-09-10T10:00:00Z",
  },
  {
    id: "pat_003",
    userId: MOCK_USER.id,
    firstName: "Liam",
    lastName: "Nguyen",
    dateOfBirth: "1998-07-02",
    email: "liam.n@email.com",
    phone: "604-555-0103",
    notes: "Recreational runner, recurring IT band syndrome.",
    createdAt: "2025-10-01T11:00:00Z",
    updatedAt: "2025-10-01T11:00:00Z",
  },
  {
    id: "pat_004",
    userId: MOCK_USER.id,
    firstName: "Priya",
    lastName: "Sharma",
    dateOfBirth: "1965-01-19",
    email: "priya.sharma@email.com",
    phone: "604-555-0104",
    notes: null,
    createdAt: "2025-10-15T09:30:00Z",
    updatedAt: "2025-10-15T09:30:00Z",
  },
  {
    id: "pat_005",
    userId: MOCK_USER.id,
    firstName: "Derek",
    lastName: "Walsh",
    dateOfBirth: "1990-05-30",
    email: null,
    phone: "604-555-0105",
    notes: "Neck and shoulder tension, office worker. Prefers morning appointments.",
    createdAt: "2026-01-08T08:00:00Z",
    updatedAt: "2026-01-08T08:00:00Z",
  },
];

// Sessions sorted newest-first
export const MOCK_SESSIONS: Session[] = [
  {
    id: "ses_001",
    userId: MOCK_USER.id,
    patientId: "pat_001",
    sessionDate: "2026-03-28T09:00:00Z",
    durationMinutes: 50,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-03-28T10:00:00Z",
  },
  {
    id: "ses_002",
    userId: MOCK_USER.id,
    patientId: "pat_003",
    sessionDate: "2026-03-27T14:00:00Z",
    durationMinutes: 45,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-27T14:00:00Z",
    updatedAt: "2026-03-27T15:00:00Z",
  },
  {
    id: "ses_003",
    userId: MOCK_USER.id,
    patientId: "pat_002",
    sessionDate: "2026-03-26T10:30:00Z",
    durationMinutes: 60,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-26T10:30:00Z",
    updatedAt: "2026-03-26T11:30:00Z",
  },
  {
    id: "ses_004",
    userId: MOCK_USER.id,
    patientId: "pat_005",
    sessionDate: "2026-03-25T08:00:00Z",
    durationMinutes: 45,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-25T08:00:00Z",
    updatedAt: "2026-03-25T09:00:00Z",
  },
  {
    id: "ses_005",
    userId: MOCK_USER.id,
    patientId: "pat_004",
    sessionDate: "2026-03-24T13:00:00Z",
    durationMinutes: 55,
    audioUrl: null,
    transcript: null,
    status: "error",
    errorMessage: "Transcription failed: audio file corrupted.",
    createdAt: "2026-03-24T13:00:00Z",
    updatedAt: "2026-03-24T14:00:00Z",
  },
  {
    id: "ses_006",
    userId: MOCK_USER.id,
    patientId: "pat_001",
    sessionDate: "2026-03-21T09:00:00Z",
    durationMinutes: 50,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-21T09:00:00Z",
    updatedAt: "2026-03-21T10:00:00Z",
  },
  {
    id: "ses_007",
    userId: MOCK_USER.id,
    patientId: "pat_002",
    sessionDate: "2026-03-19T11:00:00Z",
    durationMinutes: 60,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-19T11:00:00Z",
    updatedAt: "2026-03-19T12:00:00Z",
  },
  {
    id: "ses_008",
    userId: MOCK_USER.id,
    patientId: "pat_003",
    sessionDate: "2026-03-17T15:30:00Z",
    durationMinutes: 45,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-17T15:30:00Z",
    updatedAt: "2026-03-17T16:15:00Z",
  },
  {
    id: "ses_009",
    userId: MOCK_USER.id,
    patientId: "pat_005",
    sessionDate: "2026-03-14T08:00:00Z",
    durationMinutes: 45,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-14T08:00:00Z",
    updatedAt: "2026-03-14T09:00:00Z",
  },
  {
    id: "ses_010",
    userId: MOCK_USER.id,
    patientId: "pat_004",
    sessionDate: "2026-03-12T13:30:00Z",
    durationMinutes: 50,
    audioUrl: null,
    transcript: null,
    status: "complete",
    errorMessage: null,
    createdAt: "2026-03-12T13:30:00Z",
    updatedAt: "2026-03-12T14:30:00Z",
  },
];

// Clinical summary snippets keyed by session ID — simulates the notes table
const MOCK_CLINICAL_SUMMARIES: Record<string, string> = {
  ses_001:
    "L4-L5 mobility continuing to improve. Soft tissue work to bilateral paraspinal muscles and left QL. Patient reports 30% reduction in morning stiffness. Home exercise compliance good — reviewed hip hinge technique.",
  ses_002:
    "Right IT band syndrome. Lateral hip tightness noted on palpation. Corrected foam rolling technique. Added clamshell and lateral band walk exercises to home program. 5km run cleared with modified warm-up protocol.",
  ses_003:
    "ACL rehab week 8 post-op. Quadriceps strength at 78% of contralateral side on single-leg press. Introduced single-leg squat progression. Swelling minimal. Return-to-sport timeline on track for 14 weeks.",
  ses_004:
    "Cervical and upper trapezius tension, C4-C6 bilateral. Trigger point release performed. Patient reports headaches reduced since last visit. Ergonomic workstation review completed — monitor height adjusted.",
  ses_010:
    "Bilateral shoulder mobility assessment. Restricted right external rotation (55°). Joint mobilisation grade III applied. Posture education provided. Patient to continue thoracic extension over foam roller daily.",
};

// Helpers used by server components to simulate data fetching

function getPatientById(id: string): Patient | undefined {
  return MOCK_PATIENTS.find((p) => p.id === id);
}

export function getMockRecentSessions(limit = 10): SessionWithPatient[] {
  return MOCK_SESSIONS.slice(0, limit).map((session) => {
    const patient = getPatientById(session.patientId);
    return {
      ...session,
      patientFirstName: patient?.firstName ?? "Unknown",
      patientLastName: patient?.lastName ?? "Patient",
    };
  });
}

export function getMockSessionsThisWeek(): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  // Monday as week start
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(now.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return MOCK_SESSIONS.filter(
    (s) => new Date(s.sessionDate) >= startOfWeek
  ).length;
}

export function getMockTotalPatients(): number {
  return MOCK_PATIENTS.length;
}

export function getMockPatientsWithLastSession(): PatientWithLastSession[] {
  return MOCK_PATIENTS.map((patient) => {
    const lastCompleteSession = MOCK_SESSIONS.find(
      (s) => s.patientId === patient.id && s.status === "complete"
    );
    return {
      ...patient,
      lastSessionDate: lastCompleteSession?.sessionDate ?? null,
      lastSessionSummary: lastCompleteSession
        ? (MOCK_CLINICAL_SUMMARIES[lastCompleteSession.id] ?? null)
        : null,
    };
  });
}

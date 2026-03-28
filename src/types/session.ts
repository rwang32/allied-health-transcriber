// Application-level Session and Note types — camelCase, used throughout the app after DB conversion.

import type { SessionStatus, ConfidenceFlag } from "@/types/database";

export type { SessionStatus, ConfidenceFlag };

export interface Session {
  id: string;
  userId: string;
  patientId: string;
  sessionDate: string;
  durationMinutes: number | null;
  audioUrl: string | null;
  transcript: string | null;
  status: SessionStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  sessionId: string;
  clinicalSummary: string | null;
  editedSummary: string | null;
  aiModel: string | null;
  aiPromptVersion: string | null;
  confidenceFlags: ConfidenceFlag[];
  createdAt: string;
  updatedAt: string;
}

// Session joined with patient name — used in list views
export interface SessionWithPatient extends Session {
  patientFirstName: string;
  patientLastName: string;
}

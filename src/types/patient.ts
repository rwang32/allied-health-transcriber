// Application-level Patient type — camelCase, used throughout the app after DB conversion.

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  notes: string;
}

// Patient joined with their most recent session data — used in patient selection UI
export interface PatientWithLastSession extends Patient {
  lastSessionDate: string | null;
  lastSessionSummary: string | null;
}

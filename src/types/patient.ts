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

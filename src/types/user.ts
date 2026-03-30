// Application-level User type — camelCase, used throughout the app after DB conversion.

export interface User {
  id: string; // matches Supabase Auth user id (auth.uid())
  email: string;
  fullName: string | null;
  clinicName: string | null;
  createdAt: string;
  updatedAt: string;
}

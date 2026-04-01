import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PatientsClient } from "@/components/patients/patients-client";
import type { PatientRow } from "@/types/database";
import type { Patient } from "@/types/patient";

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

export default async function PatientsPage(): Promise<React.JSX.Element> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const db = user ? supabase : createAdminClient();
  const query = db.from("patients").select("*").order("last_name");
  const { data, error } = await (user ? query.eq("user_id", user.id) : query);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load patients: {error.message}
        </p>
      </div>
    );
  }

  const patients = (data as PatientRow[]).map(rowToPatient);

  return <PatientsClient initialPatients={patients} />;
}

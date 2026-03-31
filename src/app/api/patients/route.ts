import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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

export async function GET(): Promise<NextResponse> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "unauthorized" } },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("user_id", user.id)
    .order("last_name");

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: (data as PatientRow[]).map(rowToPatient) });
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { message: "Unauthorized", code: "unauthorized" } },
      { status: 401 },
    );
  }

  const body: unknown = await request.json();

  if (
    typeof body !== "object" ||
    body === null ||
    !("firstName" in body) ||
    !("lastName" in body) ||
    typeof (body as Record<string, unknown>).firstName !== "string" ||
    typeof (body as Record<string, unknown>).lastName !== "string" ||
    !(body as Record<string, unknown>).firstName ||
    !(body as Record<string, unknown>).lastName
  ) {
    return NextResponse.json(
      { error: { message: "firstName and lastName are required", code: "bad_request" } },
      { status: 400 },
    );
  }

  const b = body as Record<string, unknown>;

  const { data, error } = await supabase
    .from("patients")
    .insert({
      user_id: user.id,
      first_name: b.firstName as string,
      last_name: b.lastName as string,
      date_of_birth: (b.dateOfBirth as string | undefined) || null,
      email: (b.email as string | undefined) || null,
      phone: (b.phone as string | undefined) || null,
      notes: (b.notes as string | undefined) || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: rowToPatient(data as PatientRow) }, { status: 201 });
}

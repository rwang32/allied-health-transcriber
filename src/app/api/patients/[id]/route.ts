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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
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

  const { id } = await params;

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status },
    );
  }

  return NextResponse.json({ data: rowToPatient(data as PatientRow) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
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

  const { id } = await params;

  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: 500 },
    );
  }

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
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

  const { id } = await params;

  const body: unknown = await request.json();

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: { message: "Invalid request body", code: "bad_request" } },
      { status: 400 },
    );
  }

  const b = body as Record<string, unknown>;

  const updates: Record<string, unknown> = {};
  if (b.firstName !== undefined) updates.first_name = b.firstName;
  if (b.lastName !== undefined) updates.last_name = b.lastName;
  if (b.dateOfBirth !== undefined) updates.date_of_birth = b.dateOfBirth || null;
  if (b.email !== undefined) updates.email = b.email || null;
  if (b.phone !== undefined) updates.phone = b.phone || null;
  if (b.notes !== undefined) updates.notes = b.notes || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: { message: "No fields to update", code: "bad_request" } },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: rowToPatient(data as PatientRow) });
}

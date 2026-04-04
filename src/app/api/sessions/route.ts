import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SessionRow } from "@/types/database";
import type { Session } from "@/types/session";

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    userId: row.user_id,
    patientId: row.patient_id,
    sessionDate: row.session_date,
    durationMinutes: row.duration_minutes ?? null,
    audioUrl: row.audio_url ?? null,
    transcript: row.transcript ?? null,
    status: row.status,
    errorMessage: row.error_message ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
    !("patientId" in body) ||
    typeof (body as Record<string, unknown>).patientId !== "string"
  ) {
    return NextResponse.json(
      { error: { message: "patientId is required", code: "bad_request" } },
      { status: 400 },
    );
  }

  const b = body as Record<string, unknown>;

  // Ensure user row exists (required by FK — safe to upsert on every session create)
  await supabase
    .from("users")
    .upsert({ id: user.id, email: user.email ?? "" }, { onConflict: "id", ignoreDuplicates: true });

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      patient_id: b.patientId as string,
      duration_minutes: (b.durationMinutes as number | undefined) ?? null,
      status: "recording",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: rowToSession(data as SessionRow) }, { status: 201 });
}

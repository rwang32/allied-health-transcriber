import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  if (b.audioUrl !== undefined) updates.audio_url = b.audioUrl;
  if (b.status !== undefined) updates.status = b.status;
  if (b.errorMessage !== undefined) updates.error_message = b.errorMessage;
  if (b.durationMinutes !== undefined) updates.duration_minutes = b.durationMinutes;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: { message: "No fields to update", code: "bad_request" } },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { id } });
}

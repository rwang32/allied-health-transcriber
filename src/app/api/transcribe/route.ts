import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    typeof (body as Record<string, unknown>).sessionId !== "string"
  ) {
    return NextResponse.json(
      { error: { message: "sessionId is required", code: "bad_request" } },
      { status: 400 },
    );
  }

  const { sessionId } = body as { sessionId: string };

  // Fetch session to get audio_url (also verifies ownership via RLS)
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("audio_url")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session?.audio_url) {
    return NextResponse.json(
      { error: { message: "Session not found or missing audio", code: "not_found" } },
      { status: 404 },
    );
  }

  // Download audio from Supabase Storage using admin client
  const admin = createAdminClient();
  const { data: blob, error: downloadError } = await admin.storage
    .from("session-audio")
    .download(session.audio_url);

  if (downloadError || !blob) {
    return NextResponse.json(
      { error: { message: "Failed to download audio", code: "storage_error" } },
      { status: 500 },
    );
  }

  // Convert blob to File for OpenAI SDK
  const ext = session.audio_url.endsWith(".mp4") ? "mp4" : "webm";
  const mimeType = ext === "mp4" ? "audio/mp4" : "audio/webm";
  const audioFile = new File([blob], `audio.${ext}`, { type: mimeType });

  // Transcribe with Whisper
  let transcript: string;
  try {
    const result = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });
    transcript = result.text;
  } catch (err) {
    await supabase
      .from("sessions")
      .update({ status: "error", error_message: "Transcription failed" })
      .eq("id", sessionId);

    return NextResponse.json(
      { error: { message: "Transcription failed", code: "whisper_error" } },
      { status: 500 },
    );
  }

  // Save transcript and advance status
  const { error: updateError } = await supabase
    .from("sessions")
    .update({ transcript, status: "generating" })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: { message: updateError.message, code: updateError.code } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { transcript } });
}

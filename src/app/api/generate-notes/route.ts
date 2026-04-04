import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT_VERSION = "v1";

const SYSTEM_PROMPT = `You are a clinical documentation assistant for allied health practitioners (physiotherapists, chiropractors, massage therapists).

Given a raw session transcript, extract and structure the clinically relevant content into a SOAP-style note. Ignore small talk, scheduling chat, and non-clinical content.

Respond in this exact format (use the headers as written):

**Chief Complaint**
[Patient's primary reason for visit]

**History**
[Relevant history, onset, mechanism of injury, prior treatment]

**Findings**
[Objective findings: range of motion, palpation, special tests, posture]

**Treatment**
[What was performed during the session]

**Patient Response**
[How the patient responded during/after treatment]

**Recommendations**
[Home exercises, follow-up frequency, referrals, precautions]

If information for a section is not present in the transcript, write "Not documented." Be concise and use clinical language appropriate for a health record.`;

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
    typeof (body as Record<string, unknown>).sessionId !== "string" ||
    typeof (body as Record<string, unknown>).transcript !== "string"
  ) {
    return NextResponse.json(
      { error: { message: "sessionId and transcript are required", code: "bad_request" } },
      { status: 400 },
    );
  }

  const { sessionId, transcript } = body as { sessionId: string; transcript: string };

  // Verify session ownership
  const { error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError) {
    return NextResponse.json(
      { error: { message: "Session not found", code: "not_found" } },
      { status: 404 },
    );
  }

  // Generate notes with Claude
  let clinicalSummary: string;
  const model = "claude-sonnet-4-6";

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is the session transcript:\n\n${transcript}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type from Claude");
    clinicalSummary = content.text;
  } catch (err) {
    await supabase
      .from("sessions")
      .update({ status: "error", error_message: "Note generation failed" })
      .eq("id", sessionId);

    return NextResponse.json(
      { error: { message: "Note generation failed", code: "claude_error" } },
      { status: 500 },
    );
  }

  // Save note to DB
  const { error: noteError } = await supabase.from("notes").insert({
    session_id: sessionId,
    clinical_summary: clinicalSummary,
    ai_model: model,
    ai_prompt_version: PROMPT_VERSION,
    confidence_flags: [],
  });

  if (noteError) {
    return NextResponse.json(
      { error: { message: noteError.message, code: noteError.code } },
      { status: 500 },
    );
  }

  // Mark session complete
  await supabase
    .from("sessions")
    .update({ status: "complete" })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  return NextResponse.json({ data: { clinicalSummary } });
}

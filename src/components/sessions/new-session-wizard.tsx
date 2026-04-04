"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";
import { ConsentGate } from "@/components/sessions/consent-gate";
import { PatientSelector, type PatientSelection } from "@/components/sessions/patient-selector";
import { AudioRecorder } from "@/components/sessions/audio-recorder";
import { ProcessingStatus, type PipelineStage } from "@/components/sessions/processing-status";
import { createClient } from "@/lib/supabase/client";
import type { PatientWithLastSession } from "@/types/patient";
import { cn } from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

type WizardStep = "consent" | "patient" | "recording" | "processing" | "complete";

// ── Step Indicator ────────────────────────────────────────────────────────────

const STEP_LABELS: { key: Exclude<WizardStep, "consent">; label: string }[] = [
  { key: "patient", label: "Patient" },
  { key: "recording", label: "Record" },
  { key: "processing", label: "Processing" },
  { key: "complete", label: "Notes" },
];

const STEP_ORDER: WizardStep[] = ["patient", "recording", "processing", "complete"];

interface StepIndicatorProps {
  currentStep: WizardStep;
}

function StepIndicator({ currentStep }: StepIndicatorProps): React.JSX.Element | null {
  if (currentStep === "consent") return null;

  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {STEP_LABELS.map(({ key, label }, i) => {
        const stepIndex = STEP_ORDER.indexOf(key);
        const isDone = currentIndex > stepIndex;
        const isActive = currentStep === key;

        return (
          <div key={key} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isDone && "bg-blue-600 text-white",
                  isActive && "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900",
                  !isDone && !isActive && "border-2 border-zinc-200 text-zinc-400 dark:border-zinc-700"
                )}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-xs font-medium",
                  isActive && "text-blue-600 dark:text-blue-400",
                  isDone && "text-blue-600 dark:text-blue-400",
                  !isDone && !isActive && "text-zinc-400"
                )}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "mb-5 h-0.5 w-12 sm:w-16",
                  stepIndex < currentIndex ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── Complete Step ─────────────────────────────────────────────────────────────

interface CompleteStepProps {
  sessionId: string;
}

function CompleteStep({ sessionId }: CompleteStepProps): React.JSX.Element {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(interval);
          router.push(`/sessions/${sessionId}`);
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router, sessionId]);

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
        <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Notes are ready
      </h3>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        Redirecting in {countdown}…
      </p>
      <button
        onClick={() => router.push(`/sessions/${sessionId}`)}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        View Notes
      </button>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

interface NewSessionWizardProps {
  patients: PatientWithLastSession[];
  /** Pre-select a patient and skip to consent step. Used when navigating from a patient profile. */
  defaultPatientId?: string;
}

export function NewSessionWizard({ patients, defaultPatientId }: NewSessionWizardProps): React.JSX.Element {
  const defaultPatient = defaultPatientId
    ? (patients.find((p) => p.id === defaultPatientId) ?? null)
    : null;

  const [step, setStep] = useState<WizardStep>(defaultPatient ? "consent" : "patient");
  const [selectedPatientName, setSelectedPatientName] = useState<string>(
    defaultPatient ? `${defaultPatient.firstName} ${defaultPatient.lastName}` : "",
  );
  const [selectedPatientSelection, setSelectedPatientSelection] = useState<PatientSelection | null>(
    defaultPatient ? { type: "existing", patient: defaultPatient } : null,
  );
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<{ blob: Blob; duration: number } | null>(null);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("uploading");
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const handleConsentConfirm = (): void => {
    setStep("recording");
  };

  const handlePatientSelected = (selection: PatientSelection): void => {
    const name =
      selection.type === "existing"
        ? `${selection.patient.firstName} ${selection.patient.lastName}`
        : `${selection.formData.firstName} ${selection.formData.lastName}`;
    setSelectedPatientName(name);
    setSelectedPatientSelection(selection);
    setStep("consent");
  };

  const runPipeline = useCallback(async (blob: Blob, duration: number): Promise<void> => {
    setStep("processing");
    setPipelineError(null);
    setPipelineStage("uploading");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // ── 1. Resolve patient ID (create if new) ───────────────────────────────
      let patientId: string;

      if (selectedPatientSelection?.type === "existing") {
        patientId = selectedPatientSelection.patient.id;
      } else if (selectedPatientSelection?.type === "new") {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedPatientSelection.formData),
        });
        const json = await res.json() as { data?: { id: string }; error?: { message: string } };
        if (!res.ok) throw new Error(json.error?.message ?? "Failed to create patient");
        patientId = json.data!.id;
      } else {
        throw new Error("No patient selected");
      }

      // ── 2. Create session record ────────────────────────────────────────────
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          durationMinutes: Math.ceil(duration / 60),
        }),
      });
      const sessionJson = await sessionRes.json() as { data?: { id: string }; error?: { message: string } };
      if (!sessionRes.ok) throw new Error(sessionJson.error?.message ?? "Failed to create session");
      const sessionId = sessionJson.data!.id;
      setCurrentSessionId(sessionId);

      // ── 3. Upload audio to Supabase Storage ─────────────────────────────────
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const storagePath = `${user.id}/${sessionId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("session-audio")
        .upload(storagePath, blob, { contentType: blob.type, upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      // ── 4. Save audio path to session ────────────────────────────────────────
      const patchRes = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: storagePath, status: "transcribing" }),
      });
      if (!patchRes.ok) {
        const patchJson = await patchRes.json() as { error?: { message: string } };
        throw new Error(patchJson.error?.message ?? "Failed to save audio URL");
      }

      // ── 5. Transcribe ────────────────────────────────────────────────────────
      setPipelineStage("transcribing");
      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const transcribeJson = await transcribeRes.json() as { data?: { transcript: string }; error?: { message: string } };
      if (!transcribeRes.ok) throw new Error(transcribeJson.error?.message ?? "Transcription failed");
      const transcript = transcribeJson.data!.transcript;

      // ── 6. Generate notes ────────────────────────────────────────────────────
      setPipelineStage("generating");
      const generateRes = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, transcript }),
      });
      const generateJson = await generateRes.json() as { data?: unknown; error?: { message: string } };
      if (!generateRes.ok) throw new Error(generateJson.error?.message ?? "Note generation failed");

      setPipelineStage("complete");
      setStep("complete");
    } catch (err) {
      setPipelineStage("error");
      setPipelineError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }, [selectedPatientSelection]);

  const handleRecordingComplete = (blob: Blob, duration: number): void => {
    setLastBlob({ blob, duration });
    void runPipeline(blob, duration);
  };

  const handleRetry = (): void => {
    if (lastBlob) {
      void runPipeline(lastBlob.blob, lastBlob.duration);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Consent gate renders as a full-screen overlay */}
      {step === "consent" && <ConsentGate onConfirm={handleConsentConfirm} />}

      {/* Page content (visible behind consent gate, then becomes primary) */}
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <StepIndicator currentStep={step} />

        {step === "patient" && (
          <div>
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Select patient
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Choose an existing patient or add a new one.
              </p>
            </div>
            <PatientSelector patients={patients} onContinue={handlePatientSelected} />
          </div>
        )}

        {step === "recording" && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Record session
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Press record when ready. Stop when the session is complete.
              </p>
            </div>
            <AudioRecorder
              patientName={selectedPatientName}
              onRecordingComplete={handleRecordingComplete}
              onCancel={() => setStep("patient")}
            />
          </div>
        )}

        {step === "processing" && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Processing…
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                This usually takes under a minute. You can close this tab safely.
              </p>
            </div>
            <ProcessingStatus
              patientName={selectedPatientName}
              durationSeconds={lastBlob?.duration ?? 0}
              currentStage={pipelineStage}
              errorMessage={pipelineError}
              onRetry={pipelineStage === "error" ? handleRetry : undefined}
            />
          </div>
        )}

        {step === "complete" && currentSessionId && (
          <CompleteStep sessionId={currentSessionId} />
        )}
      </div>
    </div>
  );
}

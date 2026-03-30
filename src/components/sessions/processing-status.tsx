"use client";

import { CheckCircle2, Loader2, AlertCircle, Upload, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PipelineStage = "uploading" | "transcribing" | "generating" | "complete" | "error";

interface StageConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
}

const STAGES: { key: Exclude<PipelineStage, "complete" | "error">; config: StageConfig }[] = [
  {
    key: "uploading",
    config: {
      label: "Uploading audio",
      description: "Sending your recording securely",
      icon: <Upload className="h-5 w-5" />,
    },
  },
  {
    key: "transcribing",
    config: {
      label: "Transcribing",
      description: "Converting speech to text with Whisper AI",
      icon: <FileText className="h-5 w-5" />,
    },
  },
  {
    key: "generating",
    config: {
      label: "Generating notes",
      description: "Extracting clinical content with Claude AI",
      icon: <Sparkles className="h-5 w-5" />,
    },
  },
];

const STAGE_ORDER: PipelineStage[] = ["uploading", "transcribing", "generating", "complete"];

function getStageIndex(stage: PipelineStage): number {
  return STAGE_ORDER.indexOf(stage);
}

// ── Stage Row ─────────────────────────────────────────────────────────────────

interface StageRowProps {
  stageKey: Exclude<PipelineStage, "complete" | "error">;
  config: StageConfig;
  currentStage: PipelineStage;
  isError: boolean;
}

function StageRow({ stageKey, config, currentStage, isError }: StageRowProps): React.JSX.Element {
  const currentIndex = getStageIndex(currentStage);
  const stageIndex = getStageIndex(stageKey);

  const isDone = currentIndex > stageIndex;
  const isActive = currentStage === stageKey;
  const isPending = currentIndex < stageIndex;
  const isFailedHere = isError && isActive;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4 transition-all",
        isDone && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30",
        isActive && !isFailedHere && "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
        isFailedHere && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
        isPending && "border-zinc-100 bg-zinc-50 opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isDone && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
          isActive && !isFailedHere && "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
          isFailedHere && "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
          isPending && "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
        )}
      >
        {isDone && <CheckCircle2 className="h-5 w-5" />}
        {isActive && !isFailedHere && <Loader2 className="h-5 w-5 animate-spin" />}
        {isFailedHere && <AlertCircle className="h-5 w-5" />}
        {isPending && config.icon}
      </div>

      {/* Text */}
      <div>
        <p
          className={cn(
            "text-sm font-medium",
            isDone && "text-green-800 dark:text-green-300",
            isActive && !isFailedHere && "text-blue-800 dark:text-blue-300",
            isFailedHere && "text-red-800 dark:text-red-300",
            isPending && "text-zinc-500"
          )}
        >
          {config.label}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{config.description}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ProcessingStatusProps {
  patientName: string;
  durationSeconds: number;
  currentStage: PipelineStage;
  errorMessage?: string | null;
  onRetry?: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function ProcessingStatus({
  patientName,
  durationSeconds,
  currentStage,
  errorMessage,
  onRetry,
}: ProcessingStatusProps): React.JSX.Element {
  const isError = currentStage === "error";

  return (
    <div className="flex flex-col items-center">
      {/* Context */}
      <div className="mb-6 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Processing session for</p>
        <p className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {patientName}
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Recording duration: {formatDuration(durationSeconds)}
        </p>
      </div>

      {/* Stage list */}
      <div className="w-full space-y-3">
        {STAGES.map(({ key, config }) => (
          <StageRow
            key={key}
            stageKey={key}
            config={config}
            currentStage={currentStage}
            isError={isError}
          />
        ))}
      </div>

      {/* Error */}
      {isError && (
        <div className="mt-6 w-full">
          {errorMessage && (
            <p className="mb-4 text-center text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

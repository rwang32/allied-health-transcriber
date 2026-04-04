"use client";

import { useState } from "react";
import { Mic, MicOff, Pause, Play, Square, ShieldCheck, AlertCircle } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { cn } from "@/lib/utils/cn";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ── Audio Level Visualizer ────────────────────────────────────────────────────

// Fixed per-bar multipliers give the visualizer a natural waveform shape
const BAR_MULTIPLIERS = [0.5, 0.75, 0.95, 1.0, 0.9, 1.0, 0.8, 0.55];
const MIN_BAR_HEIGHT = 3; // px, always visible even at silence
const MAX_BAR_HEIGHT = 48; // px

interface AudioVisualizerProps {
  level: number; // 0–1
  isActive: boolean;
}

function AudioVisualizer({ level, isActive }: AudioVisualizerProps): React.JSX.Element {
  return (
    <div
      className="flex items-end justify-center gap-1"
      aria-hidden="true"
      style={{ height: MAX_BAR_HEIGHT }}
    >
      {BAR_MULTIPLIERS.map((mult, i) => {
        const height = isActive
          ? Math.max(MIN_BAR_HEIGHT, Math.round(level * mult * MAX_BAR_HEIGHT))
          : MIN_BAR_HEIGHT;
        return (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-full transition-none",
              isActive ? "bg-red-500" : "bg-zinc-300 dark:bg-zinc-600"
            )}
            style={{ height }}
          />
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface AudioRecorderProps {
  patientName: string;
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function AudioRecorder({
  patientName,
  onRecordingComplete,
  onCancel,
}: AudioRecorderProps): React.JSX.Element {
  const {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  } = useAudioRecorder();

  const [isStopping, setIsStopping] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleStart = async (): Promise<void> => {
    await startRecording();
  };

  const handleStop = async (): Promise<void> => {
    setIsStopping(true);
    const blob = await stopRecording();
    onRecordingComplete(blob, duration);
  };

  const handleCancel = (): void => {
    if (isRecording) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = async (): Promise<void> => {
    if (isRecording) {
      await stopRecording(); // discard blob
    }
    onCancel();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Patient context */}
      <div className="mb-6 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Recording session for</p>
        <p className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {patientName}
        </p>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/60 dark:text-green-400">
          <ShieldCheck className="h-3 w-3" />
          Consent recorded
        </span>
      </div>

      {/* Visualizer */}
      <div className="mb-6">
        <AudioVisualizer level={audioLevel} isActive={isRecording && !isPaused} />
      </div>

      {/* Timer */}
      <div
        className={cn(
          "mb-8 font-mono text-4xl font-light tabular-nums tracking-widest",
          isRecording && !isPaused
            ? "text-zinc-900 dark:text-zinc-50"
            : "text-zinc-400 dark:text-zinc-500"
        )}
      >
        {formatDuration(duration)}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls */}
      {!isRecording ? (
        /* Not yet started */
        <button
          type="button"
          onClick={handleStart}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-200 transition-transform hover:scale-105 hover:bg-red-600 active:scale-95 dark:shadow-red-900/40"
          aria-label="Start recording"
        >
          <Mic className="h-8 w-8" />
        </button>
      ) : (
        /* Recording in progress */
        <div className="flex flex-col items-center gap-6">
          {/* Stop button */}
          <button
            type="button"
            onClick={handleStop}
            disabled={isStopping}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 hover:bg-zinc-800 active:scale-95 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            aria-label="Stop recording"
          >
            <Square className="h-7 w-7 fill-current" />
          </button>

          {/* Pause / Resume */}
          <button
            type="button"
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="flex items-center gap-2 rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label={isPaused ? "Resume recording" : "Pause recording"}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            )}
          </button>

          {/* Paused indicator */}
          {isPaused && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <MicOff className="h-3.5 w-3.5" />
              Recording paused
            </div>
          )}
        </div>
      )}

      {/* Cancel */}
      <button
        type="button"
        onClick={handleCancel}
        className="mt-8 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        Cancel
      </button>

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Cancel recording?
            </h3>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              The current recording will be discarded. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Keep recording
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

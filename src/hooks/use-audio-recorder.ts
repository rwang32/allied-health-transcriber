"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface UseAudioRecorderResult {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // seconds elapsed
  audioLevel: number; // 0–1 amplitude for visualizer
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const resolveStopRef = useRef<((blob: Blob) => void) | null>(null);

  const stopLevelMonitor = useCallback((): void => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startLevelMonitor = useCallback((): void => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.fftSize);

    const tick = (): void => {
      analyser.getByteTimeDomainData(data);
      // RMS of the waveform deviation from silence (128)
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const level = Math.min(1, rms * 10);
      setAudioLevel(level);
      (window as unknown as Record<string, unknown>)._audioLevel = level;
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    setError(null);
    setDuration(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio context for level monitoring
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Pick best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e): void => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = (): void => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        resolveStopRef.current?.(blob);
        resolveStopRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        audioContextRef.current?.close();
        audioContextRef.current = null;
      };

      mediaRecorder.start(1000); // collect chunks every second
      setIsRecording(true);
      setIsPaused(false);
      startLevelMonitor();

      timerRef.current = setInterval((): void => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not access microphone"
      );
    }
  }, [startLevelMonitor]);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      resolveStopRef.current = resolve;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      stopLevelMonitor();
      setIsRecording(false);
      setIsPaused(false);

      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.stop();
      } else {
        // Nothing was recorded — resolve with empty blob
        resolve(new Blob([], { type: "audio/webm" }));
        resolveStopRef.current = null;
      }
    });
  }, [stopLevelMonitor]);

  const pauseRecording = useCallback((): void => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopLevelMonitor();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [stopLevelMonitor]);

  const resumeRecording = useCallback((): void => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startLevelMonitor();
      timerRef.current = setInterval((): void => {
        setDuration((d) => d + 1);
      }, 1000);
    }
  }, [startLevelMonitor]);

  // Clean up on unmount
  useEffect(() => {
    return (): void => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopLevelMonitor();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stopLevelMonitor]);

  return {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  };
}

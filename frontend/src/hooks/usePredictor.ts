import { useRef, useState, useCallback } from "react";
import { postPredict } from "../api/client";
import type { PredictResponse } from "../types";

export interface PredictorOptions {
  captureFrame: () => string | null;
  sessionId: string;
  pollMs?: number;
  confirmFrames?: number;
  onConfirmed?: (letter: string) => void;
}

export function usePredictor({
  captureFrame,
  sessionId,
  pollMs = 200,
  confirmFrames = 4,
  onConfirmed,
}: PredictorOptions) {
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const candidateRef = useRef("");
  const streakRef = useRef(0);
  const lastCallRef = useRef(0);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      if (now - lastCallRef.current < pollMs) return;
      lastCallRef.current = now;

      const frame = captureFrame();
      if (!frame) return;

      setLoading(true);
      setApiError(null);
      try {
        const data = await postPredict(frame, sessionId);
        setResult(data);

        const { letter, hand_detected } = data;
        if (hand_detected && letter) {
          if (letter === candidateRef.current) {
            streakRef.current += 1;
          } else {
            candidateRef.current = letter;
            streakRef.current = 1;
          }
          if (streakRef.current >= confirmFrames) {
            onConfirmed?.(letter);
            streakRef.current = 0;
          }
        } else {
          candidateRef.current = "";
          streakRef.current = 0;
        }
      } catch (e: any) {
        setApiError(e.message ?? "Prediction error");
      } finally {
        setLoading(false);
      }
    }, pollMs);
  }, [captureFrame, sessionId, pollMs, confirmFrames, onConfirmed]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    candidateRef.current = "";
    streakRef.current = 0;
    setResult(null);
    setApiError(null);
  }, []);

  return { result, loading, apiError, startPolling, stopPolling };
}

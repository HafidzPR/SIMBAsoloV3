import { useRef, useState, useCallback } from "react";
import { postPredict } from "../api/client";
import type { PredictResponse } from "../types";

export type PredictionStatus =
  | "idle"
  | "capturing"
  | "analyzing"
  | "translating"
  | "done"
  | "no_hand"
  | "error";

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
  const [status, setStatus] = useState<PredictionStatus>("idle");
  const [apiError, setApiError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const candidateRef = useRef("");
  const streakRef = useRef(0);
  const lastCallRef = useRef(0);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    setStatus("capturing");

    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      if (now - lastCallRef.current < pollMs) return;
      lastCallRef.current = now;

      const frame = captureFrame();
      if (!frame) return;

      // Step 1 — capturing frame
      setStatus("analyzing");
      setApiError(null);

      try {
        // Step 2 — sent to ML, now analyzing landmarks
        const data = await postPredict(frame, sessionId);

        if (!data.hand_detected) {
          setStatus("no_hand");
          setResult(data);
          candidateRef.current = "";
          streakRef.current = 0;
          return;
        }

        // Step 3 — hand found, translating to letter
        setStatus("translating");
        setResult(data);

        const { letter } = data;
        if (letter) {
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
        }

        // Step 4 — translation complete
        setStatus("done");
      } catch (e: any) {
        setApiError(e.message ?? "Connection error");
        setStatus("error");
        candidateRef.current = "";
        streakRef.current = 0;
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
    setStatus("idle");
  }, []);

  return { result, status, apiError, startPolling, stopPolling };
}

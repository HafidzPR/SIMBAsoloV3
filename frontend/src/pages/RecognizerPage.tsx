import { useCallback, useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { usePredictor } from "../hooks/usePredictor";
import type { PredictionStatus } from "../hooks/usePredictor";
import { LandmarkOverlay } from "../components/LandmarkOverlay";
import type { RecentSentence } from "../App";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function makeSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getConfClass(conf: number): string {
  if (conf >= 70) return "conf-fill conf-fill--high";
  if (conf >= 50) return "conf-fill conf-fill--mid";
  return "conf-fill conf-fill--low";
}

function speak(text: string) {
  if (!text.trim()) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "id-ID";
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

interface Props {
  recentSentences: RecentSentence[];
  onSaveSentence: (text: string) => void;
}

export function RecognizerPage({ recentSentences, onSaveSentence }: Props) {
  const sessionId = useRef(makeSessionId()).current;
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const { videoRef, canvasRef, active, error, start, stop, captureFrame } =
    useWebcam();
  const [word, setWord] = useState("");
  const [vidSize, setVidSize] = useState({ w: 640, h: 480 });
  const [camError, setCamError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(() =>
    parseInt(localStorage.getItem("simba-font-size") || "28"),
  );

  const onConfirmed = useCallback((letter: string) => {
    setWord((w) => w + letter);
  }, []);

  const { result, status, apiError, startPolling, stopPolling } = usePredictor({
    captureFrame,
    sessionId,
    pollMs: 200,
    confirmFrames: 4,
    onConfirmed,
  });

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handler = () =>
      setVidSize({ w: v.videoWidth || 640, h: v.videoHeight || 480 });
    v.addEventListener("loadedmetadata", handler);
    return () => v.removeEventListener("loadedmetadata", handler);
  }, [videoRef]);

  useEffect(() => {
    const handler = () =>
      setFontSize(parseInt(localStorage.getItem("simba-font-size") || "28"));
    window.addEventListener("simba-font-size-changed", handler);
    return () => window.removeEventListener("simba-font-size-changed", handler);
  }, []);

  const handleToggle = async () => {
    setCamError(null);
    if (active) {
      stop();
      stopPolling();
    } else {
      try {
        await start();
        startPolling();
      } catch {
        setCamError("Camera access denied. Please allow camera permissions.");
      }
    }
  };

  const addSpace = () => setWord((w) => w + " ");
  const deleteLetter = () => setWord((w) => w.slice(0, -1));
  const clearWord = () => setWord("");
  const saveSentence = () => {
    if (!word.trim()) return;
    onSaveSentence(word);
    setWord("");
  };
  const speakWord = () => speak(word);

  const liveLetter = result?.letter ?? "";
  const liveConf = Math.round((result?.confidence ?? 0) * 100);
  const handDetected = result?.hand_detected ?? false;
  const landmarks = result?.landmarks ?? [];
  const showLowConf = handDetected && liveConf > 0 && liveConf < 60;

  const scanText =
    status === "analyzing"
      ? "ANALYZING..."
      : status === "translating"
        ? "TRANSLATING..."
        : status === "done"
          ? "DONE"
          : active
            ? "SCANNING"
            : "";

  const scanClass =
    status === "analyzing"
      ? "cam-scanning cam-scanning--busy"
      : status === "translating"
        ? "cam-scanning cam-scanning--translating"
        : status === "done"
          ? "cam-scanning cam-scanning--done"
          : "cam-scanning";

  // Simple camera on/off dot only
  const dotClass = active ? "status-dot status-dot--on" : "status-dot";
  const dotLabel = active ? "Camera active" : "Camera off";

  return (
    <div className="page recognizer-page">
      <div className="recognizer-grid">
        {/* ── LEFT: Camera ─────────────────────────────────────────── */}
        <div className="cam-col">
          <div className="cam-frame">
            <video
              ref={videoRef}
              className={`cam-video${active ? " cam-video--active" : ""}`}
              muted
              playsInline
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <canvas
              ref={overlayRef}
              className="cam-overlay-canvas"
              width={vidSize.w}
              height={vidSize.h}
            />
            <LandmarkOverlay
              canvasRef={overlayRef}
              landmarks={landmarks}
              width={vidSize.w}
              height={vidSize.h}
            />
            {!active && (
              <div className="cam-idle">
                <div className="cam-idle-icon">◉</div>
                <p>Camera inactive</p>
              </div>
            )}
            {active && !handDetected && status !== "error" && (
              <div className="cam-hint">Show your hand</div>
            )}
            {active && scanText && <div className={scanClass}>{scanText}</div>}
          </div>

          {(camError || error) && (
            <div className="status-notification status-notification--error">
              <span className="status-notification-icon">⚠</span>
              <div>
                <strong>Camera Error</strong>
                <p>{camError ?? error}</p>
              </div>
            </div>
          )}
          {apiError && (
            <div className="status-notification status-notification--error">
              <span className="status-notification-icon">⚠</span>
              <div>
                <strong>Connection Error</strong>
                <p>{apiError}</p>
                <p className="status-notification-hint">
                  Check that the ML service is running on port 8001.
                </p>
              </div>
            </div>
          )}

          <button
            className={`btn-cam${active ? " btn-cam--stop" : " btn-cam--start"}`}
            onClick={handleToggle}
          >
            {active ? "Stop Camera" : "Start Camera"}
          </button>

          {/* Simple camera on/off status only */}
          <div className="status-bar">
            <span className={dotClass} />
            <span className="status-label">{dotLabel}</span>
          </div>

          {recentSentences.length > 0 && (
            <div className="recent-card">
              <span className="card-eyebrow">RECENT SENTENCES</span>
              <ul className="recent-list">
                {recentSentences.map((s) => (
                  <li key={s.id} className="recent-item">
                    <span className="recent-text">{s.text}</span>
                    <div className="recent-actions">
                      <span className="recent-time">{s.time}</span>
                      <button
                        className="btn-tts-small"
                        onClick={() => speak(s.text)}
                        title="Read aloud"
                      >
                        ▶
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── RIGHT ─────────────────────────────────────────────────── */}
        <div className="right-col">
          {/* Letter card — low conf shown inline WITHOUT border change */}
          <div className="letter-card">
            <div className="letter-card-header">
              <span className="card-eyebrow">LIVE DETECTION</span>
              <span
                className={`conf-warn-badge${showLowConf ? " conf-warn-badge--visible" : ""}`}
              >
                Low confidence · {liveConf}%
              </span>
            </div>
            <div className="letter-display">
              {handDetected && liveLetter ? liveLetter : "-"}
            </div>
            <div className="conf-row">
              <div className="conf-track">
                <div
                  className={getConfClass(liveConf)}
                  style={{ width: `${handDetected ? liveConf : 0}%` }}
                />
              </div>
              <span
                className={`conf-label${showLowConf ? " conf-label--warn" : ""}`}
              >
                {handDetected ? `${liveConf}%` : "-"}
              </span>
            </div>
            <p
              className={`conf-warning-text${showLowConf ? " conf-warning-text--visible" : ""}`}
            >
              Adjust hand position or lighting for better accuracy
            </p>
          </div>

          <div className="top3-card">
            <span className="card-eyebrow">TOP CANDIDATES</span>
            {handDetected && (result?.top3?.length ?? 0) > 0 ? (
              result!.top3.map((p) => (
                <div key={p.letter} className="top3-row">
                  <span className="top3-letter">{p.letter}</span>
                  <div className="top3-track">
                    <div
                      className="top3-fill"
                      style={{ width: `${Math.round(p.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="top3-pct">
                    {Math.round(p.confidence * 100)}%
                  </span>
                </div>
              ))
            ) : (
              <div className="top3-empty">Waiting for detection...</div>
            )}
          </div>

          <div className="alpha-grid">
            {ALPHABET.map((l) => (
              <span
                key={l}
                className={`alpha-cell${
                  l === liveLetter && handDetected ? " alpha-cell--lit" : ""
                }`}
              >
                {l}
              </span>
            ))}
          </div>

          <div className="builder-card">
            <span className="card-eyebrow">WORD BUILDER</span>
            <div
              className="builder-display"
              style={{ fontSize: `${fontSize}px` }}
            >
              {word ? (
                <>
                  <span>{word}</span>
                  <span className="cursor">|</span>
                </>
              ) : (
                <span className="builder-placeholder">
                  Sign letters to begin...
                </span>
              )}
            </div>
            <div className="builder-actions">
              <button
                className="btn-action"
                onClick={deleteLetter}
                disabled={!word}
              >
                ⌫ Delete
              </button>
              <button
                className="btn-action"
                onClick={addSpace}
                disabled={!word}
              >
                ␣ Space
              </button>
              <button
                className="btn-action btn-action--clear"
                onClick={clearWord}
                disabled={!word}
              >
                ✕ Clear
              </button>
              <button
                className="btn-action btn-action--tts"
                onClick={speakWord}
                disabled={!word.trim()}
              >
                ▶ Speak
              </button>
            </div>
            <button
              className="btn-save-sentence"
              onClick={saveSentence}
              disabled={!word.trim()}
            >
              ✓ Save Sentence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

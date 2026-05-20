import { useCallback, useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { usePredictor } from "../hooks/usePredictor";
import { LandmarkOverlay } from "../components/LandmarkOverlay";
import type { RecentSentence } from "../App";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function makeSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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

  const onConfirmed = useCallback((letter: string) => {
    setWord((w) => w + letter);
  }, []);

  const { result, loading, apiError, startPolling, stopPolling } = usePredictor(
    {
      captureFrame,
      sessionId,
      pollMs: 200,
      confirmFrames: 4,
      onConfirmed,
    },
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handler = () =>
      setVidSize({ w: v.videoWidth || 640, h: v.videoHeight || 480 });
    v.addEventListener("loadedmetadata", handler);
    return () => v.removeEventListener("loadedmetadata", handler);
  }, [videoRef]);

  const handleToggle = async () => {
    if (active) {
      stop();
      stopPolling();
    } else {
      await start();
      startPolling();
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

  const liveLetter = result?.letter ?? "";
  const liveConf = Math.round((result?.confidence ?? 0) * 100);
  const handDetected = result?.hand_detected ?? false;
  const landmarks = result?.landmarks ?? [];

  return (
    <div className="page recognizer-page">
      <div className="recognizer-grid">
        {/* ── LEFT: Camera + Recent sentences ───────────────────────── */}
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
            {active && !handDetected && (
              <div className="cam-hint">Show your hand</div>
            )}
            {active && loading && <div className="cam-scanning">SCANNING</div>}
          </div>

          {(error || apiError) && (
            <p className="error-banner">{error ?? apiError}</p>
          )}

          <button
            className={`btn-cam${active ? " btn-cam--stop" : " btn-cam--start"}`}
            onClick={handleToggle}
          >
            {active ? "Stop Camera" : "Start Camera"}
          </button>

          <div className="status-bar">
            <span
              className={`status-dot${active && handDetected ? " status-dot--on" : ""}`}
            />
            <span className="status-label">
              {active
                ? handDetected
                  ? "Hand detected"
                  : "Awaiting hand..."
                : "Camera off"}
            </span>
          </div>

          {recentSentences.length > 0 && (
            <div className="recent-card">
              <span className="card-eyebrow">RECENT SENTENCES</span>
              <ul className="recent-list">
                {recentSentences.map((s) => (
                  <li key={s.id} className="recent-item">
                    <span className="recent-text">{s.text}</span>
                    <span className="recent-time">{s.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── RIGHT: Detection + Word builder ───────────────────────── */}
        <div className="right-col">
          <div className="letter-card">
            <span className="card-eyebrow">LIVE DETECTION</span>
            <div className="letter-display">
              {handDetected && liveLetter ? liveLetter : "-"}
            </div>
            <div className="conf-row">
              <div className="conf-track">
                <div
                  className="conf-fill"
                  style={{ width: `${handDetected ? liveConf : 0}%` }}
                />
              </div>
              <span className="conf-label">
                {handDetected ? `${liveConf}%` : "-"}
              </span>
            </div>
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
                className={`alpha-cell${l === liveLetter && handDetected ? " alpha-cell--lit" : ""}`}
              >
                {l}
              </span>
            ))}
          </div>

          <div className="builder-card">
            <span className="card-eyebrow">WORD BUILDER</span>
            <div className="builder-display">
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

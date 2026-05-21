import { useCallback, useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import { usePredictor } from "../hooks/usePredictor";
import { LandmarkOverlay } from "../components/LandmarkOverlay";
import { useLang } from "../i18n/LanguageContext";
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
  const { t } = useLang();
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
        setCamError(t("err.cameraDenied"));
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
      ? t("rec.analyzing")
      : status === "translating"
        ? t("rec.translating")
        : status === "done"
          ? t("rec.done")
          : active
            ? t("rec.scanning")
            : "";

  const scanClass =
    status === "analyzing"
      ? "cam-scanning cam-scanning--busy"
      : status === "translating"
        ? "cam-scanning cam-scanning--translating"
        : status === "done"
          ? "cam-scanning cam-scanning--done"
          : "cam-scanning";

  const dotClass = active ? "status-dot status-dot--on" : "status-dot";
  const dotLabel = active ? t("rec.cameraActive") : t("rec.cameraOff");

  return (
    <div className="page recognizer-page">
      <div className="recognizer-grid">
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
                <p>{t("rec.cameraInactive")}</p>
              </div>
            )}
            {active && !handDetected && status !== "error" && (
              <div className="cam-hint">{t("rec.showHand")}</div>
            )}
            {active && scanText && <div className={scanClass}>{scanText}</div>}
          </div>

          {(camError || error) && (
            <div className="status-notification status-notification--error">
              <span className="status-notification-icon">⚠</span>
              <div>
                <strong>{t("err.cameraError")}</strong>
                <p>{camError ?? error}</p>
              </div>
            </div>
          )}
          {apiError && (
            <div className="status-notification status-notification--error">
              <span className="status-notification-icon">⚠</span>
              <div>
                <strong>{t("err.connectionError")}</strong>
                <p>{apiError}</p>
                <p className="status-notification-hint">{t("err.mlHint")}</p>
              </div>
            </div>
          )}

          <button
            className={`btn-cam${active ? " btn-cam--stop" : " btn-cam--start"}`}
            onClick={handleToggle}
          >
            {active ? t("rec.stopCamera") : t("rec.startCamera")}
          </button>

          <div className="status-bar">
            <span className={dotClass} />
            <span className="status-label">{dotLabel}</span>
          </div>

          {recentSentences.length > 0 && (
            <div className="recent-card">
              <span className="card-eyebrow">{t("rec.recentSentences")}</span>
              <ul className="recent-list">
                {recentSentences.map((s) => (
                  <li key={s.id} className="recent-item">
                    <span className="recent-text">{s.text}</span>
                    <div className="recent-actions">
                      <span className="recent-time">{s.time}</span>
                      <button
                        className="btn-tts-small"
                        onClick={() => speak(s.text)}
                        title={t("rec.speak")}
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

        <div className="right-col">
          <div className="letter-card">
            <div className="letter-card-header">
              <span className="card-eyebrow">{t("rec.liveDetection")}</span>
              <span
                className={`conf-warn-badge${showLowConf ? " conf-warn-badge--visible" : ""}`}
              >
                {t("rec.lowConfidence")} · {liveConf}%
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
              {t("rec.adjustHand")}
            </p>
          </div>

          <div className="top3-card">
            <span className="card-eyebrow">{t("rec.topCandidates")}</span>
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
              <div className="top3-empty">{t("rec.waitingDetection")}</div>
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
            <span className="card-eyebrow">{t("rec.wordBuilder")}</span>
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
                  {t("rec.signToBegin")}
                </span>
              )}
            </div>
            <div className="builder-actions">
              <button
                className="btn-action"
                onClick={deleteLetter}
                disabled={!word}
              >
                {t("rec.delete")}
              </button>
              <button
                className="btn-action"
                onClick={addSpace}
                disabled={!word}
              >
                {t("rec.space")}
              </button>
              <button
                className="btn-action btn-action--clear"
                onClick={clearWord}
                disabled={!word}
              >
                {t("rec.clear")}
              </button>
              <button
                className="btn-action btn-action--tts"
                onClick={speakWord}
                disabled={!word.trim()}
              >
                {t("rec.speak")}
              </button>
            </div>
            <button
              className="btn-save-sentence"
              onClick={saveSentence}
              disabled={!word.trim()}
            >
              {t("rec.saveSentence")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

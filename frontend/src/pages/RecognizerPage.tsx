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

function exportResultsCSV(results: TestResult[], lang: string) {
  const header =
    lang === "id"
      ? "Huruf Target,Huruf Terdeteksi,Benar,Kepercayaan,Dilewati"
      : "Target Letter,Detected Letter,Correct,Confidence,Skipped";
  const rows = results.map(
    (r) =>
      `${r.target},${r.detected || "-"},${r.correct},${Math.round(r.confidence * 100)}%,${r.skipped}`,
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `simba_accuracy_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface TestResult {
  target: string;
  detected: string;
  correct: boolean;
  confidence: number;
  skipped: boolean;
}

interface SessionStats {
  duration: number;
  letterCount: number;
  avgConfidence: number;
  topLetter: string;
  word: string;
}

type PageMode = "recognizer" | "test";
type TestState = "idle" | "running" | "finished";

interface Props {
  recentSentences: RecentSentence[];
  onSaveSentence: (text: string) => void;
}

export function RecognizerPage({ recentSentences, onSaveSentence }: Props) {
  const { t, lang } = useLang();
  const sessionId = useRef(makeSessionId()).current;
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const { videoRef, canvasRef, active, error, start, stop, captureFrame } =
    useWebcam();

  // ── Shared state ──────────────────────────────────────────────────────────
  const [mode, setMode] = useState<PageMode>("recognizer");
  const [vidSize, setVidSize] = useState({ w: 640, h: 480 });
  const [camError, setCamError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(() =>
    parseInt(localStorage.getItem("simba-font-size") || "28"),
  );

  // ── Recognizer state ──────────────────────────────────────────────────────
  const [word, setWord] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const sessionStartRef = useRef<number>(0);
  const sessionLettersRef = useRef<{ letter: string; confidence: number }[]>(
    [],
  );

  // ── Test state ────────────────────────────────────────────────────────────
  const [testState, setTestState] = useState<TestState>("idle");
  const [testIdx, setTestIdx] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testDetected, setTestDetected] = useState("");
  const [testConf, setTestConf] = useState(0);
  const [confirmState, setConfirmState] = useState<"waiting" | "confirmed">(
    "waiting",
  );
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const testIdxRef = useRef(0);
  const testConfRef = useRef(0);
  const testStateRef = useRef<TestState>("idle");

  const currentTarget = ALPHABET[testIdx] ?? "";

  // ── Prediction callbacks via ref so usePredictor always calls current one ─
  const modeRef = useRef<PageMode>("recognizer");
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const onConfirmedRef = useRef<(letter: string) => void>(() => {});

  const onConfirmedRecognizer = useCallback((letter: string) => {
    setWord((w) => w + letter);
  }, []);

  const onConfirmedTest = useCallback((letter: string) => {
    if (testStateRef.current !== "running") return;
    setTestDetected(letter);
    setConfirmState("confirmed");
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    confirmTimerRef.current = setTimeout(() => {
      const idx = testIdxRef.current;
      const conf = testConfRef.current;
      const target = ALPHABET[idx];
      const newResult: TestResult = {
        target,
        detected: letter,
        correct: letter === target,
        confidence: conf,
        skipped: false,
      };
      const nextIdx = idx + 1;
      if (nextIdx >= ALPHABET.length) {
        testStateRef.current = "finished";
        setTestState("finished");
        setTestResults((prev) => [...prev, newResult]);
        stopPolling();
      } else {
        testIdxRef.current = nextIdx;
        setTestIdx(nextIdx);
        setTestResults((prev) => [...prev, newResult]);
        setConfirmState("waiting");
        setTestDetected("");
      }
    }, 1200);
  }, []);

  // Keep ref pointing to correct callback based on current mode
  useEffect(() => {
    onConfirmedRef.current =
      modeRef.current === "test" ? onConfirmedTest : onConfirmedRecognizer;
  }, [mode, onConfirmedTest, onConfirmedRecognizer]);

  // Stable wrapper that always delegates to current ref
  const onConfirmed = useCallback((letter: string) => {
    onConfirmedRef.current(letter);
  }, []);

  const { result, status, apiError, startPolling, stopPolling } = usePredictor({
    captureFrame,
    sessionId,
    pollMs: 200,
    confirmFrames: mode === "test" ? 1 : 4,
    onConfirmed,
  });

  // Track confidence for test + handle test auto-advance directly
  const testHoldRef = useRef(0); // consecutive frames holding same letter
  const testLockRef = useRef(false); // prevent double-firing while timer runs

  useEffect(() => {
    if (!result?.hand_detected) return;

    const letter = result.letter ?? "";
    const conf = result.confidence ?? 0;
    testConfRef.current = conf;

    if (modeRef.current !== "test" || testStateRef.current !== "running") {
      setTestDetected(letter);
      setTestConf(conf);
      return;
    }

    // In test mode — show detected letter live
    setTestDetected(letter);
    setTestConf(conf);

    const target = ALPHABET[testIdxRef.current];

    if (letter === target && !testLockRef.current) {
      testHoldRef.current += 1;
      // Require 5 consecutive frames holding the correct letter (~1 second at 200ms)
      if (testHoldRef.current >= 5) {
        testLockRef.current = true;
        testHoldRef.current = 0;
        setConfirmState("confirmed");
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = setTimeout(() => {
          const idx = testIdxRef.current;
          const newResult: TestResult = {
            target: ALPHABET[idx],
            detected: letter,
            correct: true,
            confidence: testConfRef.current,
            skipped: false,
          };
          const nextIdx = idx + 1;
          testLockRef.current = false;
          if (nextIdx >= ALPHABET.length) {
            testStateRef.current = "finished";
            setTestState("finished");
            setTestResults((prev) => [...prev, newResult]);
            stopPolling();
          } else {
            testIdxRef.current = nextIdx;
            setTestIdx(nextIdx);
            setTestResults((prev) => [...prev, newResult]);
            setConfirmState("waiting");
            setTestDetected("");
          }
        }, 800);
      }
    } else if (letter !== target) {
      // Wrong letter — reset hold counter
      testHoldRef.current = 0;
    }
  }, [result]);

  // Track letters for session summary
  useEffect(() => {
    if (
      result?.hand_detected &&
      result.letter &&
      active &&
      mode === "recognizer"
    ) {
      sessionLettersRef.current.push({
        letter: result.letter,
        confidence: result.confidence,
      });
    }
  }, [result, active, mode]);

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

  // ── Camera toggle ─────────────────────────────────────────────────────────
  const handleToggle = async () => {
    setCamError(null);
    if (active) {
      if (mode === "recognizer") {
        const letters = sessionLettersRef.current;
        const duration = Math.round(
          (Date.now() - sessionStartRef.current) / 1000,
        );
        const avgConf =
          letters.length > 0
            ? Math.round(
                (letters.reduce((s, l) => s + l.confidence, 0) /
                  letters.length) *
                  100,
              )
            : 0;
        const freq: Record<string, number> = {};
        letters.forEach((l) => {
          freq[l.letter] = (freq[l.letter] ?? 0) + 1;
        });
        const topLetter =
          Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
        if (letters.length > 0) {
          setSessionStats({
            duration,
            letterCount: letters.length,
            avgConfidence: avgConf,
            topLetter,
            word,
          });
          setShowSummary(true);
        }
        sessionLettersRef.current = [];
      }
      stopPolling();
      stop();
      if (mode === "test") {
        testStateRef.current = "idle";
        testIdxRef.current = 0;
        testHoldRef.current = 0;
        testLockRef.current = false;
        setTestState("idle");
        setTestResults([]);
        setTestIdx(0);
        setConfirmState("waiting");
        setTestDetected("");
      }
    } else {
      try {
        sessionLettersRef.current = [];
        sessionStartRef.current = Date.now();
        await start();
        startPolling();
        if (mode === "test") {
          testStateRef.current = "running";
          testHoldRef.current = 0;
          testLockRef.current = false;
          setTestState("running");
          setTestResults([]);
          setTestIdx(0);
          setConfirmState("waiting");
          setTestDetected("");
        }
      } catch {
        setCamError(t("err.cameraDenied"));
      }
    }
  };

  // ── Mode switch — stop camera first ──────────────────────────────────────
  const handleModeSwitch = (newMode: PageMode) => {
    if (active) {
      stopPolling();
      stop();
      sessionLettersRef.current = [];
    }
    testStateRef.current = "idle";
    testIdxRef.current = 0;
    testHoldRef.current = 0;
    testLockRef.current = false;
    setMode(newMode);
    setWord("");
    setTestState("idle");
    setTestResults([]);
    setTestIdx(0);
    setConfirmState("waiting");
    setTestDetected("");
  };

  // ── Test controls ─────────────────────────────────────────────────────────
  const handleSkip = () => {
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    testHoldRef.current = 0;
    testLockRef.current = false;
    const idx = testIdxRef.current;
    const newResult: TestResult = {
      target: ALPHABET[idx],
      detected: "",
      correct: false,
      confidence: 0,
      skipped: true,
    };
    const nextIdx = idx + 1;
    if (nextIdx >= ALPHABET.length) {
      testStateRef.current = "finished";
      setTestState("finished");
      setTestResults((prev) => [...prev, newResult]);
      stopPolling();
    } else {
      testIdxRef.current = nextIdx;
      setTestIdx(nextIdx);
      setTestResults((prev) => [...prev, newResult]);
      setConfirmState("waiting");
      setTestDetected("");
    }
  };

  const handleRetakeTest = () => {
    testStateRef.current = "idle";
    testIdxRef.current = 0;
    testHoldRef.current = 0;
    testLockRef.current = false;
    setTestState("idle");
    setTestResults([]);
    setTestIdx(0);
    setConfirmState("waiting");
    setTestDetected("");
    if (active) {
      stopPolling();
      stop();
    }
  };

  // ── Recognizer controls ───────────────────────────────────────────────────
  const addSpace = () => setWord((w) => w + " ");
  const deleteLetter = () => setWord((w) => w.slice(0, -1));
  const clearWord = () => setWord("");
  const saveSentence = () => {
    if (!word.trim()) return;
    onSaveSentence(word);
    setWord("");
  };
  const speakWord = () => speak(word);

  // ── Display values ────────────────────────────────────────────────────────
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

  // ── Test stats ────────────────────────────────────────────────────────────
  const correct = testResults.filter((r) => r.correct).length;
  const incorrect = testResults.filter((r) => !r.correct && !r.skipped).length;
  const skipped = testResults.filter((r) => r.skipped).length;
  const tested = testResults.filter((r) => !r.skipped).length;
  const accuracy = tested > 0 ? Math.round((correct / tested) * 100) : 0;
  const avgTestConf =
    tested > 0
      ? Math.round(
          (testResults
            .filter((r) => !r.skipped)
            .reduce((s, r) => s + r.confidence, 0) /
            tested) *
            100,
        )
      : 0;

  return (
    <div className="page recognizer-page">
      {/* ── Mode Toggle ──────────────────────────────────────────────── */}
      <div className="mode-toggle-bar">
        <button
          className={`mode-btn${mode === "recognizer" ? " mode-btn--active" : ""}`}
          onClick={() => handleModeSwitch("recognizer")}
        >
          {t("nav.recognizer")}
        </button>
        <button
          className={`mode-btn${mode === "test" ? " mode-btn--active" : ""}`}
          onClick={() => handleModeSwitch("test")}
        >
          {t("nav.test")}
        </button>
      </div>

      <div className="recognizer-grid">
        {/* ── LEFT: Camera (shared between modes) ──────────────────── */}
        <div className="cam-col">
          <div className="cam-frame">
            <video
              ref={videoRef}
              className={`cam-video${active ? " cam-video--active" : ""}`}
              muted
              playsInline
              autoPlay
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
            disabled={mode === "test" && testState === "finished"}
          >
            {active ? t("rec.stopCamera") : t("rec.startCamera")}
          </button>

          <div className="status-bar">
            <span className={dotClass} />
            <span className="status-label">{dotLabel}</span>
          </div>

          {/* Recent sentences — recognizer mode only */}
          {mode === "recognizer" && recentSentences.length > 0 && (
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
                      >
                        ▶
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Test progress — test mode only */}
          {mode === "test" && testState === "running" && (
            <div className="test-progress">
              <div className="test-progress-header">
                <span className="card-eyebrow">{t("test.progress")}</span>
                <span className="test-progress-count">
                  {testResults.length} / {ALPHABET.length}
                </span>
              </div>
              <div className="test-progress-track">
                <div
                  className="test-progress-fill"
                  style={{
                    width: `${(testResults.length / ALPHABET.length) * 100}%`,
                  }}
                />
              </div>
              <div className="test-progress-chips">
                {ALPHABET.map((l, i) => {
                  const res = testResults.find((r) => r.target === l);
                  const isCurrent = i === testIdx;
                  return (
                    <span
                      key={l}
                      className={`test-chip${
                        isCurrent
                          ? " test-chip--current"
                          : res?.correct
                            ? " test-chip--correct"
                            : res?.skipped
                              ? " test-chip--skipped"
                              : res
                                ? " test-chip--incorrect"
                                : ""
                      }`}
                    >
                      {l}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Swaps based on mode ────────────────────────────── */}
        <div className="right-col">
          {/* ════ RECOGNIZER MODE ════ */}
          {mode === "recognizer" && (
            <>
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
                          style={{
                            width: `${Math.round(p.confidence * 100)}%`,
                          }}
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
            </>
          )}

          {/* ════ TEST MODE — IDLE ════ */}
          {mode === "test" && testState === "idle" && (
            <div className="test-idle-panel">
              <div className="test-alphabet-preview">
                {ALPHABET.map((l) => (
                  <span key={l} className="test-alpha-chip">
                    {l}
                  </span>
                ))}
              </div>
              <button className="test-start-btn" onClick={handleToggle}>
                {t("test.startTest")}
              </button>
            </div>
          )}

          {/* ════ TEST MODE — RUNNING ════ */}
          {/* ════ TEST MODE — RUNNING ════ */}
          {mode === "test" && testState === "running" && (
            <div className="test-prompt-card">
              <div className="test-how-box">
                <p className="test-how-title">{t("test.howItWorks")}</p>
                <p className="test-how-body">{t("test.howDesc")}</p>
              </div>
              <span className="card-eyebrow">{t("test.signThis")}</span>
              <div className="test-target-letter">{currentTarget}</div>
              <div className="test-detected-row">
                <span className="test-detected-label">
                  {t("test.detected")}
                </span>
                <span
                  className={`test-detected-letter${
                    confirmState === "confirmed"
                      ? testDetected === currentTarget
                        ? " test-detected--correct"
                        : " test-detected--incorrect"
                      : ""
                  }`}
                >
                  {testDetected || "—"}
                </span>
              </div>
              {confirmState === "confirmed" ? (
                <div
                  className={`test-verdict${testDetected === currentTarget ? " test-verdict--correct" : " test-verdict--incorrect"}`}
                >
                  {testDetected === currentTarget
                    ? t("test.correct")
                    : t("test.incorrect")}
                </div>
              ) : (
                <p className="test-waiting">{t("test.waitingSign")}</p>
              )}
              <button
                className="btn-secondary test-skip-btn"
                onClick={handleSkip}
              >
                {t("test.skip")}
              </button>
            </div>
          )}

          {/* ════ TEST MODE — FINISHED ════ */}
          {mode === "test" && testState === "finished" && (
            <div className="test-finished-panel">
              <div className="test-complete-badge">✓ {t("test.completed")}</div>

              <div
                className="test-results-grid"
                style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
              >
                <div className="test-result-card test-result-card--accent">
                  <span className="test-result-value">{accuracy}%</span>
                  <span className="test-result-label">
                    {t("test.accuracy")}
                  </span>
                </div>
                <div className="test-result-card">
                  <span className="test-result-value test-result-value--green">
                    {correct}
                  </span>
                  <span className="test-result-label">
                    {t("test.correct_count")}
                  </span>
                </div>
                <div className="test-result-card">
                  <span className="test-result-value test-result-value--red">
                    {incorrect}
                  </span>
                  <span className="test-result-label">
                    {t("test.incorrect_count")}
                  </span>
                </div>
                <div className="test-result-card">
                  <span className="test-result-value">{skipped}</span>
                  <span className="test-result-label">{t("test.skipped")}</span>
                </div>
                <div className="test-result-card">
                  <span className="test-result-value">{avgTestConf}%</span>
                  <span className="test-result-label">{t("test.avgConf")}</span>
                </div>
              </div>

              <div className="test-per-letter">
                <p className="settings-info-title">{t("test.perLetter")}</p>
                <div className="test-letter-grid">
                  {testResults.map((r) => (
                    <div
                      key={r.target}
                      className={`test-letter-card${
                        r.skipped
                          ? " test-letter-card--skip"
                          : r.correct
                            ? " test-letter-card--correct"
                            : " test-letter-card--wrong"
                      }`}
                    >
                      <span className="test-letter-target">{r.target}</span>
                      {!r.skipped && (
                        <span className="test-letter-detected">
                          → {r.detected || "?"}
                        </span>
                      )}
                      {r.skipped ? (
                        <span className="test-letter-status">—</span>
                      ) : (
                        <span className="test-letter-conf">
                          {Math.round(r.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="test-actions">
                <button className="btn-secondary" onClick={handleRetakeTest}>
                  {t("test.retake")}
                </button>
                <button
                  className="btn-save-sentence"
                  style={{ flex: 1 }}
                  onClick={() => exportResultsCSV(testResults, lang)}
                >
                  {t("test.exportResults")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Session Summary Modal ─────────────────────────────────── */}
      {showSummary && sessionStats && (
        <div className="sess-overlay" onClick={() => setShowSummary(false)}>
          <div className="sess-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sess-header">
              <h2 className="sess-title">{t("sess.title")}</h2>
              <button
                className="dict-modal-close"
                onClick={() => setShowSummary(false)}
              >
                ✕
              </button>
            </div>
            <div className="sess-stats">
              <div className="sess-stat">
                <span className="sess-stat-value">
                  {sessionStats.duration}
                  <small>{t("sess.seconds")}</small>
                </span>
                <span className="sess-stat-label">{t("sess.duration")}</span>
              </div>
              <div className="sess-stat">
                <span className="sess-stat-value">
                  {sessionStats.letterCount}
                </span>
                <span className="sess-stat-label">
                  {t("sess.lettersDetected")}
                </span>
              </div>
              <div className="sess-stat">
                <span className="sess-stat-value">
                  {sessionStats.avgConfidence}%
                </span>
                <span className="sess-stat-label">
                  {t("sess.avgConfidence")}
                </span>
              </div>
              <div className="sess-stat">
                <span className="sess-stat-value sess-stat-letter">
                  {sessionStats.topLetter}
                </span>
                <span className="sess-stat-label">{t("sess.topLetter")}</span>
              </div>
            </div>
            {sessionStats.word && (
              <div className="sess-word">
                <span className="card-eyebrow">{t("sess.wordBuilt")}</span>
                <span className="sess-word-text">{sessionStats.word}</span>
              </div>
            )}
            <button
              className="btn-cam btn-cam--start"
              onClick={() => setShowSummary(false)}
            >
              {t("sess.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

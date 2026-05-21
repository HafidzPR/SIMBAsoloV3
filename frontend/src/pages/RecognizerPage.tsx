import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  Trash2,
  Space,
  X,
  Play,
  BookmarkPlus,
  ChevronRight,
  SkipForward,
  Download,
  RotateCcw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
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

  const [mode, setMode] = useState<PageMode>("recognizer");
  const [vidSize, setVidSize] = useState({ w: 640, h: 480 });
  const [camError, setCamError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(() =>
    parseInt(localStorage.getItem("simba-font-size") || "28"),
  );
  const [word, setWord] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const sessionStartRef = useRef<number>(0);
  const sessionLettersRef = useRef<{ letter: string; confidence: number }[]>(
    [],
  );

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
  const testHoldRef = useRef(0);
  const testLockRef = useRef(false);
  const modeRef = useRef<PageMode>("recognizer");

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const onConfirmedRef = useRef<(letter: string) => void>(() => {});
  const onConfirmedRecognizer = useCallback((letter: string) => {
    setWord((w) => w + letter);
  }, []);
  const onConfirmedTest = useCallback((_letter: string) => {}, []);

  useEffect(() => {
    onConfirmedRef.current =
      modeRef.current === "test" ? onConfirmedTest : onConfirmedRecognizer;
  }, [mode, onConfirmedTest, onConfirmedRecognizer]);

  const onConfirmed = useCallback((letter: string) => {
    onConfirmedRef.current(letter);
  }, []);

  const { result, status, apiError, startPolling, stopPolling } = usePredictor({
    captureFrame,
    sessionId,
    pollMs: 200,
    confirmFrames: 4,
    onConfirmed,
  });

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
    setTestDetected(letter);
    setTestConf(conf);
    const target = ALPHABET[testIdxRef.current];
    if (letter === target && !testLockRef.current) {
      testHoldRef.current += 1;
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
      testHoldRef.current = 0;
    }
  }, [result]);

  useEffect(() => {
    if (
      result?.hand_detected &&
      result.letter &&
      active &&
      mode === "recognizer"
    )
      sessionLettersRef.current.push({
        letter: result.letter,
        confidence: result.confidence,
      });
  }, [result, active, mode]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const h = () =>
      setVidSize({ w: v.videoWidth || 640, h: v.videoHeight || 480 });
    v.addEventListener("loadedmetadata", h);
    return () => v.removeEventListener("loadedmetadata", h);
  }, [videoRef]);

  useEffect(() => {
    const h = () =>
      setFontSize(parseInt(localStorage.getItem("simba-font-size") || "28"));
    window.addEventListener("simba-font-size-changed", h);
    return () => window.removeEventListener("simba-font-size-changed", h);
  }, []);

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
  const currentTarget = ALPHABET[testIdx] ?? "";

  return (
    <div className="rec-page">
      {/* Mode Toggle */}
      <div className="rec-mode-bar">
        <button
          className={`rec-mode-btn${mode === "recognizer" ? " rec-mode-btn--on" : ""}`}
          onClick={() => handleModeSwitch("recognizer")}
        >
          <Camera size={14} />
          {t("nav.recognizer")}
        </button>
        <button
          className={`rec-mode-btn${mode === "test" ? " rec-mode-btn--on" : ""}`}
          onClick={() => handleModeSwitch("test")}
        >
          <ChevronRight size={14} />
          {t("nav.test")}
        </button>
      </div>

      <div className="rec-grid">
        {/* ══ LEFT: Camera ═══════════════════════════════════════════ */}
        <div className="rec-cam-col">
          <div
            className={`rec-cam-frame${active ? " rec-cam-frame--active" : ""}`}
          >
            <video
              ref={videoRef}
              className={`rec-cam-video${active ? " rec-cam-video--on" : ""}`}
              muted
              playsInline
              autoPlay
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <canvas
              ref={overlayRef}
              className="rec-cam-canvas"
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
              <div className="rec-cam-idle">
                <div className="rec-cam-idle-icon">
                  <Camera size={52} strokeWidth={1} />
                </div>
                <p className="rec-cam-idle-text">{t("rec.cameraInactive")}</p>
                <p className="rec-cam-idle-hint">{t("rec.startCamera")}</p>
              </div>
            )}

            {active && !handDetected && status !== "error" && (
              <div className="rec-cam-hint">{t("rec.showHand")}</div>
            )}
            {active && scanText && <div className={scanClass}>{scanText}</div>}

            {active && (
              <div className="rec-cam-live-badge">
                <span className="rec-live-dot" />
                LIVE
              </div>
            )}
          </div>

          {/* Error banners */}
          {(camError || error) && (
            <div className="rec-error-bar">
              <AlertTriangle size={14} />
              <span>{camError ?? error}</span>
            </div>
          )}
          {apiError && (
            <div className="rec-error-bar">
              <WifiOff size={14} />
              <span>
                {t("err.connectionError")} — {t("err.mlHint")}
              </span>
            </div>
          )}

          {/* Camera button — full width matching camera frame */}
          <button
            className={`rec-cam-btn${active ? " rec-cam-btn--stop" : " rec-cam-btn--start"}`}
            onClick={handleToggle}
            disabled={mode === "test" && testState === "finished"}
          >
            {active ? (
              <>
                <CameraOff size={16} /> {t("rec.stopCamera")}
              </>
            ) : (
              <>
                <Camera size={16} /> {t("rec.startCamera")}
              </>
            )}
          </button>
          {active && (
            <div className="rec-status-bar">
              <span className="rec-status-dot rec-status-dot--on" />
              <span className="rec-status-label">{t("rec.cameraActive")}</span>
            </div>
          )}

          {/* Test progress */}
          {mode === "test" && testState === "running" && (
            <div className="rec-test-progress">
              <div className="rec-test-progress-header">
                <span className="rec-eyebrow">{t("test.progress")}</span>
                <span className="rec-test-count">
                  {testResults.length} / {ALPHABET.length}
                </span>
              </div>
              <div className="rec-test-track">
                <div
                  className="rec-test-fill"
                  style={{
                    width: `${(testResults.length / ALPHABET.length) * 100}%`,
                  }}
                />
              </div>
              <div className="rec-test-chips">
                {ALPHABET.map((l, i) => {
                  const res = testResults.find((r) => r.target === l);
                  return (
                    <span
                      key={l}
                      className={`rec-test-chip${
                        i === testIdx
                          ? " rec-test-chip--cur"
                          : res?.correct
                            ? " rec-test-chip--ok"
                            : res?.skipped
                              ? " rec-test-chip--skip"
                              : res
                                ? " rec-test-chip--fail"
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

          {/* Recent sentences */}
          {mode === "recognizer" && recentSentences.length > 0 && (
            <div className="rec-recent">
              <span className="rec-eyebrow">{t("rec.recentSentences")}</span>
              <div className="rec-recent-list">
                {recentSentences.map((s) => (
                  <div key={s.id} className="rec-recent-item">
                    <span className="rec-recent-text">{s.text}</span>
                    <div className="rec-recent-meta">
                      <span className="rec-recent-time">{s.time}</span>
                      <button
                        className="rec-icon-btn"
                        onClick={() => speak(s.text)}
                      >
                        <Play size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT: Output Panel ════════════════════════════════════ */}
        <div className="rec-output-col">
          {/* ════ RECOGNIZER MODE ════ */}
          {mode === "recognizer" && (
            <>
              {/* Detection panel — fixed height */}
              <div className="rec-detect-panel">
                <div className="rec-detect-header">
                  <span className="rec-eyebrow">{t("rec.liveDetection")}</span>
                  <span
                    className={`rec-warn-badge${showLowConf ? " rec-warn-badge--on" : ""}`}
                  >
                    <AlertTriangle size={10} />
                    {t("rec.lowConfidence")} {liveConf}%
                  </span>
                </div>
                <div className="rec-letter-display">
                  <span
                    className={`rec-letter${handDetected && liveLetter ? " rec-letter--on" : ""}`}
                  >
                    {handDetected && liveLetter ? liveLetter : "—"}
                  </span>
                </div>
                <div className="rec-conf-row">
                  <div className="rec-conf-track">
                    <div
                      className={`rec-conf-fill ${getConfClass(liveConf)}`}
                      style={{ width: `${handDetected ? liveConf : 0}%` }}
                    />
                  </div>
                  <span
                    className={`rec-conf-pct${showLowConf ? " rec-conf-pct--warn" : ""}`}
                  >
                    {handDetected ? `${liveConf}%` : "—"}
                  </span>
                </div>
                <p
                  className={`rec-warn-text${showLowConf ? " rec-warn-text--on" : ""}`}
                >
                  {t("rec.adjustHand")}
                </p>
              </div>

              {/* Top3 + Alphabet row */}
              <div className="rec-secondary-row">
                <div className="rec-top3-panel">
                  <span className="rec-eyebrow">{t("rec.topCandidates")}</span>
                  <div className="rec-top3-list">
                    {handDetected && (result?.top3?.length ?? 0) > 0 ? (
                      result!.top3.map((p) => (
                        <div key={p.letter} className="rec-top3-row">
                          <span className="rec-top3-letter">{p.letter}</span>
                          <div className="rec-top3-track">
                            <div
                              className="rec-top3-fill"
                              style={{
                                width: `${Math.round(p.confidence * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="rec-top3-pct">
                            {Math.round(p.confidence * 100)}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rec-top3-empty">
                        {t("rec.waitingDetection")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="rec-alpha-panel">
                  <span className="rec-eyebrow">A–Z</span>
                  <div className="rec-alpha-grid">
                    {ALPHABET.map((l) => (
                      <span
                        key={l}
                        className={`rec-alpha-cell${l === liveLetter && handDetected ? " rec-alpha-cell--on" : ""}`}
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Word builder */}
              <div className="rec-builder-panel">
                <div className="rec-builder-header">
                  <span className="rec-eyebrow">{t("rec.wordBuilder")}</span>
                  <button
                    className="rec-icon-btn rec-icon-btn--speak"
                    onClick={speakWord}
                    disabled={!word.trim()}
                  >
                    <Mic size={12} />
                    {t("rec.speak")}
                  </button>
                </div>
                <div
                  className="rec-builder-output"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {word ? (
                    <>
                      <span>{word}</span>
                      <span className="rec-cursor">|</span>
                    </>
                  ) : (
                    <span className="rec-builder-ph">
                      {t("rec.signToBegin")}
                    </span>
                  )}
                </div>
                <div className="rec-builder-actions">
                  <button
                    className="rec-action-btn"
                    onClick={deleteLetter}
                    disabled={!word}
                  >
                    <Trash2 size={13} /> {t("rec.delete")}
                  </button>
                  <button
                    className="rec-action-btn"
                    onClick={addSpace}
                    disabled={!word}
                  >
                    <Space size={13} /> {t("rec.space")}
                  </button>
                  <button
                    className="rec-action-btn rec-action-btn--clear"
                    onClick={clearWord}
                    disabled={!word}
                  >
                    <X size={13} /> {t("rec.clear")}
                  </button>
                </div>
                <button
                  className="rec-save-btn"
                  onClick={saveSentence}
                  disabled={!word.trim()}
                >
                  <BookmarkPlus size={16} />
                  {t("rec.saveSentence")}
                </button>
              </div>
            </>
          )}

          {/* ════ TEST MODE — IDLE ════ */}
          {mode === "test" && testState === "idle" && (
            <div className="rec-test-idle">
              <div className="rec-test-info">
                <p className="rec-eyebrow">{t("test.howItWorks")}</p>
                <p className="rec-test-info-text">{t("test.howDesc")}</p>
              </div>
              <div className="rec-test-alpha-preview">
                {ALPHABET.map((l) => (
                  <span key={l} className="rec-test-chip">
                    {l}
                  </span>
                ))}
              </div>
              <button className="rec-test-start-btn" onClick={handleToggle}>
                <Play size={16} />
                {t("test.startTest")}
              </button>
            </div>
          )}

          {/* ════ TEST MODE — RUNNING ════ */}
          {mode === "test" && testState === "running" && (
            <div className="rec-test-running">
              <div className="rec-test-how-inline">
                <p className="rec-eyebrow">{t("test.howItWorks")}</p>
                <p className="rec-test-how-text">{t("test.howDesc")}</p>
              </div>
              <div className="rec-test-prompt">
                <span className="rec-eyebrow">{t("test.signThis")}</span>
                <div className="rec-test-target">{currentTarget}</div>
                <div className="rec-test-detected-row">
                  <span className="rec-test-detected-label">
                    {t("test.detected")}
                  </span>
                  <span
                    className={`rec-test-detected${
                      confirmState === "confirmed"
                        ? testDetected === currentTarget
                          ? " rec-test-detected--ok"
                          : " rec-test-detected--fail"
                        : ""
                    }`}
                  >
                    {testDetected || "—"}
                  </span>
                </div>
                {confirmState === "confirmed" ? (
                  <div
                    className={`rec-test-verdict${testDetected === currentTarget ? " rec-test-verdict--ok" : " rec-test-verdict--fail"}`}
                  >
                    {testDetected === currentTarget
                      ? t("test.correct")
                      : t("test.incorrect")}
                  </div>
                ) : (
                  <p className="rec-test-waiting">{t("test.waitingSign")}</p>
                )}
                <button
                  className="rec-action-btn rec-test-skip"
                  onClick={handleSkip}
                >
                  <SkipForward size={13} /> {t("test.skip")}
                </button>
              </div>
            </div>
          )}

          {/* ════ TEST MODE — FINISHED ════ */}
          {mode === "test" && testState === "finished" && (
            <div className="rec-test-finished">
              <div className="rec-test-done-badge">✓ {t("test.completed")}</div>
              <div className="rec-test-results-grid">
                <div className="rec-test-result-card rec-test-result-card--accent">
                  <span className="rec-test-result-val">{accuracy}%</span>
                  <span className="rec-test-result-label">
                    {t("test.accuracy")}
                  </span>
                </div>
                <div className="rec-test-result-card">
                  <span className="rec-test-result-val rec-test-result-val--green">
                    {correct}
                  </span>
                  <span className="rec-test-result-label">
                    {t("test.correct_count")}
                  </span>
                </div>
                <div className="rec-test-result-card">
                  <span className="rec-test-result-val rec-test-result-val--red">
                    {incorrect}
                  </span>
                  <span className="rec-test-result-label">
                    {t("test.incorrect_count")}
                  </span>
                </div>
                <div className="rec-test-result-card">
                  <span className="rec-test-result-val">{skipped}</span>
                  <span className="rec-test-result-label">
                    {t("test.skipped")}
                  </span>
                </div>
                <div className="rec-test-result-card">
                  <span className="rec-test-result-val">{avgTestConf}%</span>
                  <span className="rec-test-result-label">
                    {t("test.avgConf")}
                  </span>
                </div>
              </div>
              <div className="rec-test-per-letter">
                <p className="rec-eyebrow" style={{ marginBottom: 10 }}>
                  {t("test.perLetter")}
                </p>
                <div className="rec-test-letter-grid">
                  {testResults.map((r) => (
                    <div
                      key={r.target}
                      className={`rec-test-letter-card${
                        r.skipped
                          ? " rec-test-letter-card--skip"
                          : r.correct
                            ? " rec-test-letter-card--ok"
                            : " rec-test-letter-card--fail"
                      }`}
                    >
                      <span className="rec-test-letter-val">{r.target}</span>
                      {!r.skipped && (
                        <span className="rec-test-letter-det">
                          → {r.detected || "?"}
                        </span>
                      )}
                      <span className="rec-test-letter-conf">
                        {r.skipped ? "—" : `${Math.round(r.confidence * 100)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rec-test-actions">
                <button className="rec-action-btn" onClick={handleRetakeTest}>
                  <RotateCcw size={13} /> {t("test.retake")}
                </button>
                <button
                  className="rec-save-btn"
                  style={{ flex: 1 }}
                  onClick={() => exportResultsCSV(testResults, lang)}
                >
                  <Download size={16} /> {t("test.exportResults")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Summary Modal */}
      {showSummary && sessionStats && (
        <div className="sess-overlay" onClick={() => setShowSummary(false)}>
          <div className="sess-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sess-header">
              <h2 className="sess-title">{t("sess.title")}</h2>
              <button
                className="dict-modal-close"
                onClick={() => setShowSummary(false)}
              >
                <X size={16} />
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
              className="rec-cam-btn rec-cam-btn--start"
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

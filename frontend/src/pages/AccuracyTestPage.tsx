// import { useCallback, useEffect, useRef, useState } from "react";
// import { useWebcam } from "../hooks/useWebcam";
// import { usePredictor } from "../hooks/usePredictor";
// import { LandmarkOverlay } from "../components/LandmarkOverlay";
// import { useLang } from "../i18n/LanguageContext";

// const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// interface LetterResult {
//   target: string;
//   detected: string;
//   correct: boolean;
//   confidence: number;
//   skipped: boolean;
// }

// type TestState = "idle" | "testing" | "finished";

// function exportResultsCSV(results: LetterResult[], lang: string) {
//   const header =
//     lang === "id"
//       ? "Huruf Target,Huruf Terdeteksi,Benar,Kepercayaan,Dilewati"
//       : "Target Letter,Detected Letter,Correct,Confidence,Skipped";
//   const rows = results.map(
//     (r) =>
//       `${r.target},${r.detected || "-"},${r.correct},${Math.round(r.confidence * 100)}%,${r.skipped}`,
//   );
//   const csv = [header, ...rows].join("\n");
//   const blob = new Blob([csv], { type: "text/csv" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `simba_accuracy_test_${new Date().toISOString().slice(0, 10)}.csv`;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// export function AccuracyTestPage() {
//   const { t, lang } = useLang();
//   const overlayRef = useRef<HTMLCanvasElement>(null);

//   const { videoRef, canvasRef, active, error, start, stop, captureFrame } =
//     useWebcam();

//   const [testState, setTestState] = useState<TestState>("idle");
//   const [currentIdx, setCurrentIdx] = useState(0);
//   const [results, setResults] = useState<LetterResult[]>([]);
//   const [detectedLetter, setDetectedLetter] = useState("");
//   const [detectedConf, setDetectedConf] = useState(0);
//   const [confirmState, setConfirmState] = useState<"waiting" | "confirmed">(
//     "waiting",
//   );
//   const [vidSize, setVidSize] = useState({ w: 640, h: 480 });
//   const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const currentTarget = ALPHABET[currentIdx] ?? "";

//   const onConfirmed = useCallback(
//     (letter: string) => {
//       if (testState !== "testing") return;
//       setDetectedLetter(letter);
//       setConfirmState("confirmed");
//       if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
//       confirmTimerRef.current = setTimeout(() => {
//         recordResult(letter, detectedConf, false);
//       }, 1200);
//     },
//     [testState, currentIdx, detectedConf],
//   );

//   const { result, startPolling, stopPolling } = usePredictor({
//     captureFrame,
//     sessionId: "accuracy_test",
//     pollMs: 200,
//     confirmFrames: 3,
//     onConfirmed,
//   });

//   useEffect(() => {
//     if (result?.hand_detected) {
//       setDetectedLetter(result.letter ?? "");
//       setDetectedConf(result.confidence ?? 0);
//     }
//   }, [result]);

//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v) return;
//     const h = () =>
//       setVidSize({ w: v.videoWidth || 640, h: v.videoHeight || 480 });
//     v.addEventListener("loadedmetadata", h);
//     return () => v.removeEventListener("loadedmetadata", h);
//   }, [videoRef]);

//   const recordResult = (detected: string, conf: number, skipped: boolean) => {
//     const newResult: LetterResult = {
//       target: ALPHABET[currentIdx],
//       detected,
//       correct: !skipped && detected === ALPHABET[currentIdx],
//       confidence: conf,
//       skipped,
//     };
//     setResults((prev) => {
//       const updated = [...prev, newResult];
//       if (currentIdx + 1 >= ALPHABET.length) {
//         setTestState("finished");
//         stopPolling();
//         stop();
//       } else {
//         setCurrentIdx((i) => i + 1);
//         setConfirmState("waiting");
//         setDetectedLetter("");
//       }
//       return updated;
//     });
//   };

//   const handleStart = async () => {
//     setResults([]);
//     setCurrentIdx(0);
//     setConfirmState("waiting");
//     setDetectedLetter("");
//     await start();
//     startPolling();
//     setTestState("testing");
//   };

//   const handleStop = () => {
//     stopPolling();
//     stop();
//     setTestState("idle");
//     setResults([]);
//     setCurrentIdx(0);
//   };

//   const handleSkip = () => {
//     if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
//     recordResult("", 0, true);
//   };

//   const handleRetake = () => {
//     stop();
//     setTestState("idle");
//     setResults([]);
//     setCurrentIdx(0);
//   };

//   // Stats
//   const correct = results.filter((r) => r.correct).length;
//   const incorrect = results.filter((r) => !r.correct && !r.skipped).length;
//   const skipped = results.filter((r) => r.skipped).length;
//   const accuracy =
//     results.length > 0
//       ? Math.round(
//           (correct / results.filter((r) => !r.skipped).length || 0) * 100,
//         )
//       : 0;
//   const avgConf =
//     results.length > 0
//       ? Math.round(
//           (results
//             .filter((r) => !r.skipped)
//             .reduce((s, r) => s + r.confidence, 0) /
//             (results.filter((r) => !r.skipped).length || 1)) *
//             100,
//         )
//       : 0;

//   return (
//     <div className="page test-page">
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">{t("test.title")}</h1>
//           <p className="page-subtitle">{t("test.subtitle")}</p>
//         </div>
//         {testState === "testing" && (
//           <button className="btn-danger" onClick={handleStop}>
//             {t("test.stopTest")}
//           </button>
//         )}
//       </div>

//       {/* ── IDLE STATE ───────────────────────────────────────────────── */}
//       {testState === "idle" && (
//         <div>
//           <div className="test-info-box">
//             <p className="settings-info-title">{t("test.howItWorks")}</p>
//             <p className="test-info-desc">{t("test.howDesc")}</p>
//           </div>
//           <div className="test-alphabet-preview">
//             {ALPHABET.map((l) => (
//               <span key={l} className="test-alpha-chip">
//                 {l}
//               </span>
//             ))}
//           </div>
//           <button className="test-start-btn" onClick={handleStart}>
//             {t("test.startTest")}
//           </button>
//           {error && (
//             <p className="error-banner" style={{ marginTop: 16 }}>
//               {t("test.noCamera")}
//             </p>
//           )}
//         </div>
//       )}

//       {/* ── TESTING STATE ────────────────────────────────────────────── */}
//       {testState === "testing" && (
//         <div className="test-grid">
//           <div className="test-cam-col">
//             <div className="cam-frame">
//               <video
//                 ref={videoRef}
//                 className={`cam-video${active ? " cam-video--active" : ""}`}
//                 muted
//                 playsInline
//                 autoPlay
//                 style={{ transform: "scaleX(-1)" }}
//               />
//               <canvas ref={canvasRef} style={{ display: "none" }} />
//               <canvas
//                 ref={overlayRef}
//                 className="cam-overlay-canvas"
//                 width={vidSize.w}
//                 height={vidSize.h}
//               />
//               <LandmarkOverlay
//                 canvasRef={overlayRef}
//                 landmarks={result?.landmarks ?? []}
//                 width={vidSize.w}
//                 height={vidSize.h}
//               />
//             </div>
//             {/* Progress bar */}
//             <div className="test-progress">
//               <div className="test-progress-header">
//                 <span className="card-eyebrow">{t("test.progress")}</span>
//                 <span className="test-progress-count">
//                   {results.length} / {ALPHABET.length}
//                 </span>
//               </div>
//               <div className="test-progress-track">
//                 <div
//                   className="test-progress-fill"
//                   style={{
//                     width: `${(results.length / ALPHABET.length) * 100}%`,
//                   }}
//                 />
//               </div>
//               <div className="test-progress-chips">
//                 {ALPHABET.map((l, i) => {
//                   const res = results.find((r) => r.target === l);
//                   const isCurrent = i === currentIdx;
//                   return (
//                     <span
//                       key={l}
//                       className={`test-chip ${
//                         isCurrent
//                           ? "test-chip--current"
//                           : res?.correct
//                             ? "test-chip--correct"
//                             : res?.skipped
//                               ? "test-chip--skipped"
//                               : res
//                                 ? "test-chip--incorrect"
//                                 : ""
//                       }`}
//                     >
//                       {l}
//                     </span>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           <div className="test-prompt-col">
//             <div className="test-prompt-card">
//               <span className="card-eyebrow">{t("test.signThis")}</span>
//               <div className="test-target-letter">{currentTarget}</div>
//               <div className="test-detected-row">
//                 <span className="test-detected-label">
//                   {t("test.detected")}
//                 </span>
//                 <span
//                   className={`test-detected-letter ${
//                     confirmState === "confirmed"
//                       ? detectedLetter === currentTarget
//                         ? "test-detected--correct"
//                         : "test-detected--incorrect"
//                       : ""
//                   }`}
//                 >
//                   {detectedLetter || "—"}
//                 </span>
//               </div>
//               {confirmState === "confirmed" && (
//                 <div
//                   className={`test-verdict ${
//                     detectedLetter === currentTarget
//                       ? "test-verdict--correct"
//                       : "test-verdict--incorrect"
//                   }`}
//                 >
//                   {detectedLetter === currentTarget
//                     ? t("test.correct")
//                     : t("test.incorrect")}
//                 </div>
//               )}
//               {confirmState === "waiting" && (
//                 <p className="test-waiting">{t("test.waitingSign")}</p>
//               )}
//               <button
//                 className="btn-secondary test-skip-btn"
//                 onClick={handleSkip}
//               >
//                 {t("test.skip")}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── FINISHED STATE ───────────────────────────────────────────── */}
//       {testState === "finished" && (
//         <div>
//           <div className="test-results-header">
//             <div className="test-complete-badge">✓ {t("test.completed")}</div>
//           </div>

//           <div className="test-results-grid">
//             <div className="test-result-card test-result-card--accent">
//               <span className="test-result-value">{accuracy}%</span>
//               <span className="test-result-label">{t("test.accuracy")}</span>
//             </div>
//             <div className="test-result-card">
//               <span className="test-result-value test-result-value--green">
//                 {correct}
//               </span>
//               <span className="test-result-label">
//                 {t("test.correct_count")}
//               </span>
//             </div>
//             <div className="test-result-card">
//               <span className="test-result-value test-result-value--red">
//                 {incorrect}
//               </span>
//               <span className="test-result-label">
//                 {t("test.incorrect_count")}
//               </span>
//             </div>
//             <div className="test-result-card">
//               <span className="test-result-value">{skipped}</span>
//               <span className="test-result-label">{t("test.skipped")}</span>
//             </div>
//             <div className="test-result-card">
//               <span className="test-result-value">{avgConf}%</span>
//               <span className="test-result-label">{t("test.avgConf")}</span>
//             </div>
//           </div>

//           <div className="test-per-letter">
//             <p className="settings-info-title" style={{ marginBottom: 12 }}>
//               {t("test.perLetter")}
//             </p>
//             <div className="test-letter-grid">
//               {results.map((r) => (
//                 <div
//                   key={r.target}
//                   className={`test-letter-card ${
//                     r.skipped
//                       ? "test-letter-card--skip"
//                       : r.correct
//                         ? "test-letter-card--correct"
//                         : "test-letter-card--wrong"
//                   }`}
//                 >
//                   <span className="test-letter-target">{r.target}</span>
//                   {!r.skipped && (
//                     <span className="test-letter-detected">
//                       → {r.detected || "?"}
//                     </span>
//                   )}
//                   {r.skipped ? (
//                     <span className="test-letter-status">—</span>
//                   ) : (
//                     <span className="test-letter-conf">
//                       {Math.round(r.confidence * 100)}%
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="test-actions">
//             <button className="btn-secondary" onClick={handleRetake}>
//               {t("test.retake")}
//             </button>
//             <button
//               className="btn-save-sentence"
//               style={{ flex: 1 }}
//               onClick={() => exportResultsCSV(results, lang)}
//             >
//               {t("test.exportResults")}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import {
  getHistory,
  deleteHistory,
  getSentences,
  deleteSentences,
} from "../api/client";
import { useLang } from "../i18n/LanguageContext";
import type { HistoryItem } from "../types";

interface SavedSentence {
  id: number;
  text: string;
  timestamp: string;
  session_id: string;
}

type Tab = "sentences" | "letters";

function speak(text: string) {
  if (!text.trim()) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "id-ID";
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

function exportCSV(letters: HistoryItem[]) {
  const header = "ID,Letter,Confidence,Timestamp,Session";
  const rows = letters.map(
    (r) =>
      `${r.id},${r.letter},${Math.round(r.confidence * 100)}%,${r.timestamp},${r.session_id}`,
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `simba_history_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function HistoryPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("sentences");
  const [sentences, setSentences] = useState<SavedSentence[]>([]);
  const [letters, setLetters] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([getSentences(), getHistory()]);
      setSentences(s);
      setLetters(l);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleClearSentences = async () => {
    if (!confirm(t("dash.deleteConfirmSent"))) return;
    try {
      await deleteSentences();
      setSentences([]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleClearLetters = async () => {
    if (!confirm(t("dash.deleteConfirmPred"))) return;
    try {
      await deleteHistory();
      setLetters([]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const bySession = letters.reduce<Record<string, HistoryItem[]>>(
    (acc, item) => {
      (acc[item.session_id] ??= []).push(item);
      return acc;
    },
    {},
  );

  const filteredSentences = sentences.filter(
    (s) =>
      !filter.trim() || s.text.toLowerCase().includes(filter.toLowerCase()),
  );
  const filteredSessions = Object.entries(bySession).filter(([, rows]) => {
    if (!filter.trim()) return true;
    return rows
      .map((r) => r.letter)
      .join("")
      .toLowerCase()
      .includes(filter.toLowerCase());
  });

  return (
    <div className="page history-page">
      <div className="history-header">
        <div>
          <h1 className="page-title">{t("hist.title")}</h1>
          <p className="page-subtitle">
            {t("hist.subtitle", { s: sentences.length, l: letters.length })}
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn-secondary"
            onClick={loadAll}
            disabled={loading}
          >
            {t("hist.refresh")}
          </button>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="history-search">
        <input
          className="history-search-input"
          placeholder={t("hist.filter")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {filter && (
          <button
            className="history-search-clear"
            onClick={() => setFilter("")}
          >
            ✕
          </button>
        )}
      </div>

      <div className="history-tabs">
        <button
          className={`history-tab${tab === "sentences" ? " history-tab--active" : ""}`}
          onClick={() => setTab("sentences")}
        >
          {t("hist.savedSentences")}{" "}
          <span className="history-tab-count">{sentences.length}</span>
        </button>
        <button
          className={`history-tab${tab === "letters" ? " history-tab--active" : ""}`}
          onClick={() => setTab("letters")}
        >
          {t("hist.letterPredictions")}{" "}
          <span className="history-tab-count">{letters.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">{t("common.loading")}</div>
      ) : tab === "sentences" ? (
        <div>
          <div className="history-tab-header">
            <p className="history-tab-desc">{t("hist.lettersDesc")}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-secondary"
                onClick={() => exportCSV(letters)}
                disabled={letters.length === 0}
              >
                {t("hist.export")}
              </button>
              <button
                className="btn-danger"
                onClick={handleClearLetters}
                disabled={letters.length === 0}
              >
                {t("hist.clearLetters")}
              </button>
            </div>
          </div>
          {filteredSentences.length === 0 ? (
            <div className="empty-state">
              <p>{t("hist.noSentences")}</p>
              <p>{t("hist.noSentencesHint")}</p>
            </div>
          ) : (
            <div className="sentences-list">
              {filteredSentences.map((s, i) => (
                <div key={s.id} className="sentence-row">
                  <div className="sentence-row-num">
                    {filteredSentences.length - i}
                  </div>
                  <div className="sentence-row-main">
                    <span className="sentence-row-text">{s.text}</span>
                    <span className="sentence-row-session">
                      {t("hist.session")} {s.session_id.slice(-5)}
                    </span>
                  </div>
                  <div className="sentence-row-right">
                    <div className="sentence-row-time">
                      {new Date(s.timestamp).toLocaleString()}
                    </div>
                    <button
                      className="btn-tts-small"
                      onClick={() => speak(s.text)}
                      title={t("rec.speak")}
                    >
                      ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="history-tab-header">
            <p className="history-tab-desc">{t("hist.lettersDesc")}</p>
            <button
              className="btn-danger"
              onClick={handleClearLetters}
              disabled={letters.length === 0}
            >
              {t("hist.clearLetters")}
            </button>
          </div>
          {filteredSessions.length === 0 ? (
            <div className="empty-state">
              <p>{t("hist.noLetters")}</p>
              <p>{t("hist.noLettersHint")}</p>
            </div>
          ) : (
            <div className="history-sessions">
              {filteredSessions.map(([sid, rows]) => {
                const word = rows.map((r) => r.letter).join("");
                const avgConf = Math.round(
                  (rows.reduce((s, r) => s + r.confidence, 0) / rows.length) *
                    100,
                );
                const earliest = rows[rows.length - 1]?.timestamp;
                return (
                  <div key={sid} className="session-block">
                    <div className="session-header">
                      <div className="session-header-left">
                        <span className="session-word">{word || "—"}</span>
                        <span className="session-badge">
                          {rows.length} {t("hist.letters")}
                        </span>
                      </div>
                      <div className="session-header-right">
                        <button
                          className="btn-tts-small"
                          onClick={() => speak(word)}
                          title={t("rec.speak")}
                        >
                          ▶
                        </button>
                        <span className="session-avgconf">
                          {t("hist.avg")} {avgConf}%
                        </span>
                        <svg
                          className="sparkline"
                          viewBox={`0 0 ${rows.length * 6} 24`}
                          width={rows.length * 6}
                          height={24}
                        >
                          <polyline
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="1.5"
                            points={rows
                              .map(
                                (r, i) =>
                                  `${i * 6},${24 - Math.round(r.confidence * 22)}`,
                              )
                              .join(" ")}
                          />
                        </svg>
                        <span className="session-meta">
                          {earliest ? new Date(earliest).toLocaleString() : ""}
                        </span>
                      </div>
                    </div>
                    <div className="history-table-wrap">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>{t("dash.id")}</th>
                            <th>{t("dash.letter")}</th>
                            <th>{t("dash.confidence")}</th>
                            <th>{t("dash.time")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((item) => (
                            <tr key={item.id}>
                              <td className="td-id">{item.id}</td>
                              <td className="td-letter">{item.letter}</td>
                              <td className="td-conf">
                                <div className="mini-bar-track">
                                  <div
                                    className="mini-bar-fill"
                                    style={{
                                      width: `${Math.round(item.confidence * 100)}%`,
                                    }}
                                  />
                                </div>
                                <span>
                                  {Math.round(item.confidence * 100)}%
                                </span>
                              </td>
                              <td className="td-time">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

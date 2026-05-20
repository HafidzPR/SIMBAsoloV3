import { useEffect, useState } from "react";
import {
  getHistory,
  deleteHistory,
  getSentences,
  deleteSentences,
} from "../api/client";
import type { HistoryItem } from "../types";

interface SavedSentence {
  id: number;
  text: string;
  timestamp: string;
  session_id: string;
}

type Tab = "sentences" | "letters";

export function HistoryPage() {
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
    if (!confirm("Delete all saved sentences?")) return;
    try {
      await deleteSentences();
      setSentences([]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleClearLetters = async () => {
    if (!confirm("Delete all letter prediction history?")) return;
    try {
      await deleteHistory();
      setLetters([]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // Group letters by session
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
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="history-header">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">
            {sentences.length} saved sentences · {letters.length} letter
            predictions
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn-secondary"
            onClick={loadAll}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────────── */}
      <div className="history-desc">
        <div className="history-desc-item">
          <span
            className="history-desc-dot"
            style={{ background: "var(--accent)" }}
          />
          <div>
            <strong>Saved Sentences</strong> — words and phrases you formed in
            the Word Builder and saved with the Save Sentence button.
          </div>
        </div>
        <div className="history-desc-item">
          <span
            className="history-desc-dot"
            style={{ background: "var(--accent-dim)" }}
          />
          <div>
            <strong>Letter Predictions</strong> — every individual letter
            detected by the ML model above the confidence threshold, grouped by
            session.
          </div>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {/* ── Search ──────────────────────────────────────────────────── */}
      <div className="history-search">
        <input
          className="history-search-input"
          placeholder="Filter..."
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

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="history-tabs">
        <button
          className={`history-tab${tab === "sentences" ? " history-tab--active" : ""}`}
          onClick={() => setTab("sentences")}
        >
          Saved Sentences
          <span className="history-tab-count">{sentences.length}</span>
        </button>
        <button
          className={`history-tab${tab === "letters" ? " history-tab--active" : ""}`}
          onClick={() => setTab("letters")}
        >
          Letter Predictions
          <span className="history-tab-count">{letters.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : /* ── SENTENCES TAB ─────────────────────────────────────────── */
      tab === "sentences" ? (
        <div>
          <div className="history-tab-header">
            <p className="history-tab-desc">
              These are sentences you intentionally saved. Each row shows the
              full text, when it was saved, and which session it came from.
            </p>
            <button
              className="btn-danger"
              onClick={handleClearSentences}
              disabled={sentences.length === 0}
            >
              ✕ Clear Sentences
            </button>
          </div>

          {filteredSentences.length === 0 ? (
            <div className="empty-state">
              <p>No saved sentences yet.</p>
              <p>
                Use the Word Builder on the Recognizer page, then press Save
                Sentence.
              </p>
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
                      Session {s.session_id.slice(-5)}
                    </span>
                  </div>
                  <div className="sentence-row-time">
                    {new Date(s.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── LETTERS TAB ───────────────────────────────────────────── */
        <div>
          <div className="history-tab-header">
            <p className="history-tab-desc">
              Every letter the ML model detected above the confidence threshold,
              grouped by session. A session is one continuous camera session on
              the Recognizer page.
            </p>
            <button
              className="btn-danger"
              onClick={handleClearLetters}
              disabled={letters.length === 0}
            >
              ✕ Clear Letters
            </button>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="empty-state">
              <p>No letter predictions yet.</p>
              <p>
                Start the camera on the Recognizer page and sign some letters.
              </p>
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
                          {rows.length} letters
                        </span>
                      </div>
                      <div className="session-header-right">
                        <span className="session-avgconf">avg {avgConf}%</span>
                        <span className="session-meta">
                          {earliest ? new Date(earliest).toLocaleString() : ""}
                        </span>
                      </div>
                    </div>
                    <div className="history-table-wrap">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Letter</th>
                            <th>Confidence</th>
                            <th>Time</th>
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

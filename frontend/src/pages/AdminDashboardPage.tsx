import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminStats,
  getLetterFrequency,
  getHistory,
  deleteHistory,
  getSentences,
  deleteSentences,
  getSettings,
  putSetting,
} from "../api/client";
import type { AdminStats, HistoryItem, SettingItem } from "../types";

interface SentenceItem {
  id: number;
  text: string;
  timestamp: string;
  session_id: string;
}

interface LetterFreqItem {
  letter: string;
  count: number;
}

type Tab = "overview" | "history" | "sentences" | "settings";

const BAR_COLORS = [
  "#6366f1",
  "#818cf8",
  "#a5b4fc",
  "#c7d2fe",
  "#4338ca",
  "#3730a3",
  "#4f46e5",
  "#6366f1",
];

function speakText(text: string) {
  if (!text.trim()) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "id-ID";
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [adminName, setAdminName] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [freq, setFreq] = useState<LetterFreqItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const info = localStorage.getItem("simba_admin_info");
    if (!info) {
      navigate("/admin/login");
      return;
    }
    setAdminName(JSON.parse(info).username);
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, f, h, se, st] = await Promise.all([
        getAdminStats(),
        getLetterFrequency(),
        getHistory(),
        getSentences(),
        getSettings(),
      ]);
      setStats(s);
      setFreq(f);
      setHistory(h);
      setSentences(se);
      setSettings(st);
      const d: Record<string, string> = {};
      st.forEach((x) => (d[x.key] = x.value));
      setDrafts(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (key: string) => {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      const updated = await putSetting(key, drafts[key]);
      setSettings((prev) => prev.map((s) => (s.key === key ? updated : s)));
      setSaved((s) => ({ ...s, [key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  const tabList: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "history", label: `Predictions (${history.length})` },
    { id: "sentences", label: `Sentences (${sentences.length})` },
    { id: "settings", label: "Settings" },
  ];

  const maxCount = freq.length > 0 ? Math.max(...freq.map((f) => f.count)) : 1;
  const top10 = freq.slice(0, 10);

  return (
    <div className="page admin-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Logged in as {adminName}</p>
        </div>
        <button className="btn-secondary" onClick={loadAll} disabled={loading}>
          ↻ Refresh
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="history-tabs" style={{ marginBottom: 24 }}>
        {tabList.map((t) => (
          <button
            key={t.id}
            className={`history-tab${tab === t.id ? " history-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading dashboard...</div>
      ) : (
        <>
          {/* ── Overview ─────────────────────────────────────────────── */}
          {tab === "overview" && stats && (
            <div>
              <div className="dash-stats-grid">
                <div className="dash-stat-card">
                  <span className="dash-stat-value">
                    {stats.total_predictions}
                  </span>
                  <span className="dash-stat-label">Total Predictions</span>
                </div>
                <div className="dash-stat-card">
                  <span className="dash-stat-value">
                    {stats.total_sessions}
                  </span>
                  <span className="dash-stat-label">Sessions</span>
                </div>
                <div className="dash-stat-card">
                  <span className="dash-stat-value">
                    {Math.round(stats.avg_confidence * 100)}%
                  </span>
                  <span className="dash-stat-label">Avg Confidence</span>
                </div>
                <div className="dash-stat-card">
                  <span className="dash-stat-value dash-stat-letter">
                    {stats.top_letter}
                  </span>
                  <span className="dash-stat-label">Most Detected</span>
                </div>
                <div className="dash-stat-card">
                  <span className="dash-stat-value">
                    {stats.total_sentences}
                  </span>
                  <span className="dash-stat-label">Saved Sentences</span>
                </div>
              </div>

              {top10.length > 0 ? (
                <div className="dash-chart-card">
                  <p className="card-eyebrow" style={{ marginBottom: 20 }}>
                    TOP DETECTED LETTERS
                  </p>
                  <div className="dash-chart">
                    {top10.map((item, i) => (
                      <div key={item.letter} className="dash-bar-group">
                        <div className="dash-bar-wrap">
                          <span className="dash-bar-count">{item.count}</span>
                          <div
                            className="dash-bar"
                            style={{
                              height: `${Math.max(8, Math.round((item.count / maxCount) * 200))}px`,
                              background: BAR_COLORS[i % BAR_COLORS.length],
                              opacity: 0.4 + 0.6 * (item.count / maxCount),
                            }}
                          />
                        </div>
                        <span className="dash-bar-label">{item.letter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ marginTop: 24 }}>
                  No prediction data yet. Start signing on the Recognizer page.
                </div>
              )}
            </div>
          )}

          {/* ── Predictions ──────────────────────────────────────────── */}
          {tab === "history" && (
            <div>
              <div className="history-tab-header">
                <p className="history-tab-desc">
                  All letter predictions recorded by the ML model above the
                  confidence threshold.
                </p>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    if (!confirm("Delete all prediction history?")) return;
                    await deleteHistory();
                    setHistory([]);
                    loadAll();
                  }}
                  disabled={history.length === 0}
                >
                  ✕ Clear All
                </button>
              </div>
              {history.length === 0 ? (
                <div className="empty-state">No predictions yet.</div>
              ) : (
                <div className="history-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Letter</th>
                        <th>Confidence</th>
                        <th>Session</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
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
                            <span>{Math.round(item.confidence * 100)}%</span>
                          </td>
                          <td className="td-id">{item.session_id.slice(-8)}</td>
                          <td className="td-time">
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Sentences ─────────────────────────────────────────────── */}
          {tab === "sentences" && (
            <div>
              <div className="history-tab-header">
                <p className="history-tab-desc">
                  Sentences saved by users from the Word Builder. Click ▶ to
                  hear them read aloud.
                </p>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    if (!confirm("Delete all saved sentences?")) return;
                    await deleteSentences();
                    setSentences([]);
                    loadAll();
                  }}
                  disabled={sentences.length === 0}
                >
                  ✕ Clear All
                </button>
              </div>
              {sentences.length === 0 ? (
                <div className="empty-state">No saved sentences yet.</div>
              ) : (
                <div className="sentences-list">
                  {sentences.map((s, i) => (
                    <div key={s.id} className="sentence-row">
                      <div className="sentence-row-num">{i + 1}</div>
                      <div className="sentence-row-main">
                        <span className="sentence-row-text">{s.text}</span>
                        <span className="sentence-row-session">
                          Session {s.session_id.slice(-5)}
                        </span>
                      </div>
                      <div className="sentence-row-right">
                        <div className="sentence-row-time">
                          {new Date(s.timestamp).toLocaleString()}
                        </div>
                        <button
                          className="btn-tts-small"
                          onClick={() => speakText(s.text)}
                          title="Read aloud"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ──────────────────────────────────────────────── */}
          {tab === "settings" && (
            <div>
              <p className="history-tab-desc" style={{ marginBottom: 16 }}>
                These settings are stored in SQLite and take effect immediately.
              </p>
              <div className="settings-list">
                {settings.map((s) => (
                  <div key={s.key} className="setting-row">
                    <div className="setting-meta">
                      <span className="setting-key">{s.key}</span>
                      <span className="setting-label">{s.label}</span>
                    </div>
                    <div className="setting-control">
                      <input
                        className="setting-input"
                        value={drafts[s.key] ?? ""}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [s.key]: e.target.value }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSaveSetting(s.key)
                        }
                      />
                      <button
                        className={`btn-save${saved[s.key] ? " btn-save--done" : ""}`}
                        onClick={() => handleSaveSetting(s.key)}
                        disabled={saving[s.key] || drafts[s.key] === s.value}
                      >
                        {saving[s.key]
                          ? "…"
                          : saved[s.key]
                            ? "✓ Saved"
                            : "Save"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

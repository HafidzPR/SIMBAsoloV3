import { useEffect, useState } from "react";
import { getSettings, putSetting } from "../api/client";
import type { SettingItem } from "../types";

interface SettingsPageProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export function SettingsPage({ theme, setTheme }: SettingsPageProps) {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
        const d: Record<string, string> = {};
        data.forEach((s) => (d[s.key] = s.value || ""));
        setDrafts(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, val: string) => {
    setDrafts((d) => ({ ...d, [key]: val }));
    setSaved((s) => ({ ...s, [key]: false }));
  };

  const handleSave = async (key: string) => {
    setSaving((s) => ({ ...s, [key]: true }));
    setError(null);
    try {
      const updated = await putSetting(key, drafts[key]);
      setSettings((prev) => prev.map((s) => (s.key === key ? updated : s)));
      setDrafts((d) => ({ ...d, [key]: updated.value }));
      setSaved((s) => ({ ...s, [key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  };

  // Theme is local only — no backend call needed
  const handleThemeToggle = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Stored in SQLite · takes effect immediately
          </p>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {/* ── Appearance ───────────────────────────────────────────────── */}
      <div className="settings-list" style={{ marginBottom: "20px" }}>
        <div className="setting-row">
          <div className="setting-meta">
            <span className="setting-key">interface_theme</span>
            <span className="setting-label">
              Switch the color scheme across all pages. Your choice is saved in
              the browser and restored on next launch.
            </span>
          </div>
          <div className="setting-control">
            <button
              className="btn-secondary"
              style={{
                borderColor:
                  theme === "dark" ? "var(--accent)" : "var(--border-mid)",
                background:
                  theme === "dark" ? "var(--accent-glow)" : "transparent",
                color:
                  theme === "dark"
                    ? "var(--accent-text)"
                    : "var(--text-secondary)",
                fontWeight: theme === "dark" ? 700 : 400,
                minWidth: "100px",
              }}
              onClick={() => handleThemeToggle("dark")}
            >
              Dark Mode
            </button>
            <button
              className="btn-secondary"
              style={{
                borderColor:
                  theme === "light" ? "var(--accent)" : "var(--border-mid)",
                background:
                  theme === "light" ? "var(--accent-glow)" : "transparent",
                color:
                  theme === "light"
                    ? "var(--accent-text)"
                    : "var(--text-secondary)",
                fontWeight: theme === "light" ? 700 : 400,
                minWidth: "100px",
              }}
              onClick={() => handleThemeToggle("light")}
            >
              Light Mode
            </button>
          </div>
        </div>
      </div>

      {/* ── Database settings ─────────────────────────────────────────── */}
      {loading ? (
        <div className="loading-state">Loading settings...</div>
      ) : (
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
                  onChange={(e) => handleChange(s.key, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave(s.key)}
                />
                <button
                  className={`btn-save${saved[s.key] ? " btn-save--done" : ""}`}
                  onClick={() => handleSave(s.key)}
                  disabled={saving[s.key] || drafts[s.key] === s.value}
                >
                  {saving[s.key] ? "…" : saved[s.key] ? "✓ Saved" : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="settings-info-box">
        <p className="settings-info-title">HOW SETTINGS WORK</p>
        <ul className="settings-info-list">
          <li>
            <strong>confidence_threshold</strong>
            {" — predictions below this are not saved to history"}
          </li>
          <li>
            <strong>confirm_frames</strong>
            {
              " — letter must appear this many times in a row before being appended"
            }
          </li>
          <li>
            <strong>poll_interval_ms</strong>
            {" — how often a frame is sent; lower is faster but heavier on CPU"}
          </li>
          <li>
            <strong>model_version</strong>
            {" — informational only; change the actual file in "}
            <code>ml-service/models/</code>
          </li>
        </ul>
      </div>
    </div>
  );
}

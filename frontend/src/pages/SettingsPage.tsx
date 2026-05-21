import { useEffect, useState } from "react";
import { getSettings, putSetting } from "../api/client";
import type { SettingItem } from "../types";

interface SettingsPageProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const FONT_SIZES = [
  { label: "Small", value: 20 },
  { label: "Medium", value: 28 },
  { label: "Large", value: 36 },
  { label: "X-Large", value: 48 },
];

// These keys are managed by custom UI controls above — hide from raw DB list
const HIDDEN_KEYS = new Set(["display_font_size"]);

export function SettingsPage({ theme, setTheme }: SettingsPageProps) {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSizeState] = useState<number>(() =>
    parseInt(localStorage.getItem("simba-font-size") || "28"),
  );

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

  const handleFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem("simba-font-size", String(size));
    window.dispatchEvent(new Event("simba-font-size-changed"));
  };

  const visibleSettings = settings.filter((s) => !HIDDEN_KEYS.has(s.key));

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Configure system behaviour · changes take effect immediately
          </p>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {/* ── Appearance ───────────────────────────────────────────────── */}
      <p className="settings-section-title">APPEARANCE</p>
      <div className="settings-list" style={{ marginBottom: 28 }}>
        <div className="setting-row">
          <div className="setting-meta">
            <span className="setting-key">interface_theme</span>
            <span className="setting-label">
              Color scheme applied across all pages. Saved in the browser.
            </span>
          </div>
          <div className="setting-control">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                className="btn-secondary"
                style={{
                  borderColor:
                    theme === t ? "var(--accent)" : "var(--border-mid)",
                  background:
                    theme === t ? "var(--accent-glow)" : "transparent",
                  color:
                    theme === t
                      ? "var(--accent-text)"
                      : "var(--text-secondary)",
                  fontWeight: theme === t ? 700 : 400,
                  minWidth: "100px",
                }}
                onClick={() => setTheme(t)}
              >
                {t === "dark" ? "Dark Mode" : "Light Mode"}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-meta">
            <span className="setting-key">display_font_size</span>
            <span className="setting-label">
              Word Builder text size. Larger is easier to read across the
              counter.
            </span>
          </div>
          <div className="setting-control" style={{ gap: 6 }}>
            {FONT_SIZES.map((f) => (
              <button
                key={f.value}
                className="btn-secondary"
                style={{
                  borderColor:
                    fontSize === f.value
                      ? "var(--accent)"
                      : "var(--border-mid)",
                  background:
                    fontSize === f.value ? "var(--accent-glow)" : "transparent",
                  color:
                    fontSize === f.value
                      ? "var(--accent-text)"
                      : "var(--text-secondary)",
                  fontWeight: fontSize === f.value ? 700 : 400,
                  minWidth: 72,
                }}
                onClick={() => handleFontSize(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-meta">
            <span className="setting-key">font_preview</span>
            <span className="setting-label">
              Live preview of how the Word Builder text will appear.
            </span>
          </div>
          <div className="font-preview" style={{ fontSize: `${fontSize}px` }}>
            SIMBAsoloV3
          </div>
        </div>
      </div>

      {/* ── ML / System Settings ──────────────────────────────────────── */}
      <p className="settings-section-title">ML &amp; SYSTEM</p>
      {loading ? (
        <div className="loading-state">Loading settings...</div>
      ) : (
        <div className="settings-list">
          {visibleSettings.map((s) => (
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

      <div className="settings-info-box" style={{ marginTop: 28 }}>
        <p className="settings-info-title">HOW SETTINGS WORK</p>
        <ul className="settings-info-list">
          <li>
            <strong>confidence_threshold</strong>
            {" — predictions below this value are not saved to history"}
          </li>
          <li>
            <strong>confirm_frames</strong>
            {
              " — a letter must appear this many consecutive frames before being added"
            }
          </li>
          <li>
            <strong>poll_interval_ms</strong>
            {
              " — how often a frame is sent to the ML service; lower = faster but heavier on CPU"
            }
          </li>
          <li>
            <strong>model_version</strong>
            {" — informational only; swap the actual file in "}
            <code>ml-service/models/</code>
          </li>
        </ul>
      </div>
    </div>
  );
}

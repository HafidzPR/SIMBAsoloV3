import { useEffect, useState } from "react";
import { getSettings, putSetting } from "../api/client";
import { useLang } from "../i18n/LanguageContext";
import type { SettingItem } from "../types";

interface SettingsPageProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const HIDDEN_KEYS = new Set(["display_font_size"]);

export function SettingsPage({ theme, setTheme }: SettingsPageProps) {
  const { t, lang, setLang } = useLang();
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSizeState] = useState<number>(() =>
    parseInt(localStorage.getItem("simba-font-size") || "28"),
  );

  const FONT_SIZES = [
    { label: t("set.small"), value: 20 },
    { label: t("set.medium"), value: 28 },
    { label: t("set.large"), value: 36 },
    { label: t("set.xlarge"), value: 48 },
  ];

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
          <h1 className="page-title">{t("set.title")}</h1>
          <p className="page-subtitle">{t("set.subtitle")}</p>
        </div>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <p className="settings-section-title">{t("set.appearance")}</p>
      <div className="settings-list" style={{ marginBottom: 28 }}>
        {/* Theme */}
        <div className="setting-row">
          <div className="setting-meta">
            <span className="setting-key">{t("set.themeKey")}</span>
            <span className="setting-label">{t("set.themeLabel")}</span>
          </div>
          <div className="setting-control">
            {(["dark", "light"] as const).map((thm) => (
              <button
                key={thm}
                className="btn-secondary"
                style={{
                  borderColor:
                    theme === thm ? "var(--accent)" : "var(--border-mid)",
                  background:
                    theme === thm ? "var(--accent-glow)" : "transparent",
                  color:
                    theme === thm
                      ? "var(--accent-text)"
                      : "var(--text-secondary)",
                  fontWeight: theme === thm ? 700 : 400,
                  minWidth: 100,
                }}
                onClick={() => setTheme(thm)}
              >
                {thm === "dark" ? t("set.darkMode") : t("set.lightMode")}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="setting-row">
          <div className="setting-meta">
            <span className="setting-key">{t("set.langKey")}</span>
            <span className="setting-label">{t("set.langLabel")}</span>
          </div>
          <div className="setting-control">
            {(["en", "id"] as const).map((l) => (
              <button
                key={l}
                className="btn-secondary"
                style={{
                  borderColor:
                    lang === l ? "var(--accent)" : "var(--border-mid)",
                  background: lang === l ? "var(--accent-glow)" : "transparent",
                  color:
                    lang === l ? "var(--accent-text)" : "var(--text-secondary)",
                  fontWeight: lang === l ? 700 : 400,
                  minWidth: 100,
                }}
                onClick={() => setLang(l)}
              >
                {l === "en" ? "🇬🇧 English" : "🇮🇩 Indonesia"}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="setting-row">
          <div className="setting-meta">
            <span className="setting-key">{t("set.fontSizeKey")}</span>
            <span className="setting-label">{t("set.fontSizeLabel")}</span>
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

        {/* Font preview */}
        <div className="setting-row">
          <div className="setting-meta">
            <span className="setting-key">{t("set.fontPreviewKey")}</span>
            <span className="setting-label">{t("set.fontPreviewLabel")}</span>
          </div>
          <div className="font-preview" style={{ fontSize: `${fontSize}px` }}>
            SIMBAsoloV3
          </div>
        </div>
      </div>

      <p className="settings-section-title">{t("set.mlSystem")}</p>
      {loading ? (
        <div className="loading-state">{t("set.loading")}</div>
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
                  {saving[s.key]
                    ? "…"
                    : saved[s.key]
                      ? t("set.saved")
                      : t("set.save")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="settings-info-box" style={{ marginTop: 28 }}>
        <p className="settings-info-title">{t("set.howItWorks")}</p>
        <ul className="settings-info-list">
          <li>
            <strong>confidence_threshold</strong> — {t("set.confThreshDesc")}
          </li>
          <li>
            <strong>confirm_frames</strong> — {t("set.confirmFramesDesc")}
          </li>
          <li>
            <strong>poll_interval_ms</strong> — {t("set.pollDesc")}
          </li>
          <li>
            <strong>model_version</strong> — {t("set.modelDesc")}
          </li>
        </ul>
      </div>
    </div>
  );
}

import { useLang } from "../i18n/LanguageContext";

export function AboutPage() {
  const { t } = useLang();

  const techStack = [
    { label: t("about.frontend"), value: "React 18 · TypeScript · Vite" },
    { label: t("about.backend"), value: "FastAPI · SQLAlchemy · SQLite" },
    { label: t("about.mlService"), value: "TensorFlow · MediaPipe · OpenCV" },
    { label: t("about.database"), value: "SQLite (simba.db)" },
    { label: t("about.version"), value: "SIMBAsoloV3" },
  ];

  return (
    <div className="page about-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("about.title")}</h1>
          <p className="page-subtitle">{t("about.subtitle")}</p>
        </div>
      </div>

      <div className="about-grid">
        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="about-col">
          {/* What is it */}
          <div className="about-card">
            <h2 className="about-section-title">{t("about.whatTitle")}</h2>
            <p className="about-text">{t("about.whatDesc")}</p>
          </div>

          {/* What is SIBI */}
          <div className="about-card">
            <h2 className="about-section-title">{t("about.sibiTitle")}</h2>
            <p className="about-text">{t("about.sibiDesc")}</p>
          </div>

          {/* How to use */}
          <div className="about-card">
            <h2 className="about-section-title">{t("about.howUseTitle")}</h2>
            <ol className="about-steps">
              {[
                t("about.howUse1"),
                t("about.howUse2"),
                t("about.howUse3"),
                t("about.howUse4"),
                t("about.howUse5"),
                t("about.howUse6"),
              ].map((step, i) => (
                <li key={i} className="about-step">
                  <span className="about-step-num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Right column ────────────────────────────────────────── */}
        <div className="about-col">
          {/* Tips */}
          <div className="about-card">
            <h2 className="about-section-title">{t("about.tipsTitle")}</h2>
            <ul className="about-tips">
              {[
                t("about.tip1"),
                t("about.tip2"),
                t("about.tip3"),
                t("about.tip4"),
                t("about.tip5"),
              ].map((tip, i) => (
                <li key={i} className="about-tip">
                  <span className="about-tip-dot">◆</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer info */}
          <div className="about-card about-card--accent">
            <h2 className="about-section-title">{t("about.devTitle")}</h2>
            <div className="about-dev-row">
              <span className="about-dev-label">Developer</span>
              <span className="about-dev-value">Hafidz Putra Rachman</span>
            </div>
            <div className="about-dev-row">
              <span className="about-dev-label">NIM</span>
              <span className="about-dev-value">21120120140096</span>
            </div>
            <div className="about-dev-row">
              <span className="about-dev-label">University</span>
              <span className="about-dev-value">Universitas Diponegoro</span>
            </div>
            <div className="about-dev-row">
              <span className="about-dev-label">Department</span>
              <span className="about-dev-value">Teknik Komputer</span>
            </div>
            <div className="about-capstone">
              <p className="about-section-title" style={{ marginTop: 16 }}>
                {t("about.capstoneTitle")}
              </p>
              <p className="about-capstone-title">
                Sistem Penerjemah Gerakan Bahasa Isyarat ke kata-kata Teks
                Menggunakan Jaringan Saraf Konvolusional dengan Arsitektur
                MobileNet berbasis Python
              </p>
            </div>
          </div>

          {/* Tech stack */}
          <div className="about-card">
            <h2 className="about-section-title">{t("about.techTitle")}</h2>
            <div className="about-tech-list">
              {techStack.map((item) => (
                <div key={item.label} className="about-tech-row">
                  <span className="about-tech-label">{item.label}</span>
                  <span className="about-tech-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

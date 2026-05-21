import { useLang } from "../i18n/LanguageContext";
import {
  Camera,
  Brain,
  Zap,
  Volume2,
  BookOpen,
  BarChart2,
  Globe,
  Shield,
  Lightbulb,
  CheckCircle2,
  Code2,
  Database,
  Cpu,
  Layers,
  User,
  GraduationCap,
  Building2,
} from "lucide-react";

export function AboutPage() {
  const { t } = useLang();

  const features = [
    {
      icon: <Camera size={20} />,
      color: "#0ea5e9",
      label: "CNN MobileNet",
      desc: t("about.whatTitle"),
    },
    {
      icon: <Brain size={20} />,
      color: "#6366f1",
      label: "MediaPipe",
      desc: "Hand landmark detection",
    },
    {
      icon: <Zap size={20} />,
      color: "#f59e0b",
      label: "Real-Time",
      desc: "200ms response time",
    },
    {
      icon: <Volume2 size={20} />,
      color: "#10b981",
      label: "Text-to-Speech",
      desc: "Indonesian language TTS",
    },
    {
      icon: <BookOpen size={20} />,
      color: "#0ea5e9",
      label: "SIBI Dictionary",
      desc: "26 alphabet signs",
    },
    {
      icon: <BarChart2 size={20} />,
      color: "#6366f1",
      label: "Accuracy Test",
      desc: "Per-letter results",
    },
    {
      icon: <Globe size={20} />,
      color: "#f59e0b",
      label: "Bilingual",
      desc: "English & Indonesian",
    },
    {
      icon: <Shield size={20} />,
      color: "#10b981",
      label: "Admin Panel",
      desc: "Secure dashboard",
    },
  ];

  const steps = [
    { icon: <Camera size={16} />, text: t("about.howUse1") },
    { icon: <Layers size={16} />, text: t("about.howUse2") },
    { icon: <CheckCircle2 size={16} />, text: t("about.howUse3") },
    { icon: <BookOpen size={16} />, text: t("about.howUse4") },
    { icon: <Database size={16} />, text: t("about.howUse5") },
    { icon: <Volume2 size={16} />, text: t("about.howUse6") },
  ];

  const tips = [
    { icon: <Lightbulb size={14} />, text: t("about.tip1") },
    { icon: <Camera size={14} />, text: t("about.tip2") },
    { icon: <Zap size={14} />, text: t("about.tip3") },
    { icon: <BookOpen size={14} />, text: t("about.tip4") },
    { icon: <Brain size={14} />, text: t("about.tip5") },
  ];

  const techStack = [
    {
      icon: <Code2 size={16} />,
      label: t("about.frontend"),
      value: "React 18 · TypeScript · Vite",
      color: "#0ea5e9",
    },
    {
      icon: <Cpu size={16} />,
      label: t("about.backend"),
      value: "FastAPI · SQLAlchemy",
      color: "#6366f1",
    },
    {
      icon: <Brain size={16} />,
      label: t("about.mlService"),
      value: "TensorFlow · MediaPipe · OpenCV",
      color: "#f59e0b",
    },
    {
      icon: <Database size={16} />,
      label: t("about.database"),
      value: "SQLite (simba.db)",
      color: "#10b981",
    },
  ];

  return (
    <div className="page about-page">
      {/* ── Hero banner ──────────────────────────────────────────────── */}
      <div className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-logo">
            <img src="/logo.png" alt="SIMBAsoloV3" className="about-hero-img" />
          </div>
          <div>
            <h1 className="about-hero-title">SIMBAsoloV3</h1>
            <p className="about-hero-sub">{t("about.subtitle")}</p>
            <p className="about-hero-desc">{t("about.whatDesc")}</p>
          </div>
        </div>
        <div className="about-hero-glow" />
      </div>

      {/* ── Feature grid ─────────────────────────────────────────────── */}
      <div className="about-features-grid">
        {features.map((f) => (
          <div key={f.label} className="about-feature-card">
            <div
              className="about-feature-icon"
              style={{ background: `${f.color}18`, color: f.color }}
            >
              {f.icon}
            </div>
            <div>
              <p className="about-feature-label">{f.label}</p>
              <p className="about-feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="about-two-col">
        {/* ── Left ─────────────────────────────────────────────────── */}
        <div className="about-col">
          {/* What is SIBI */}
          <div className="about-card">
            <div className="about-card-header">
              <div
                className="about-card-icon"
                style={{
                  background: "rgba(14,165,233,0.12)",
                  color: "#0ea5e9",
                }}
              >
                <BookOpen size={18} />
              </div>
              <h2 className="about-section-title">{t("about.sibiTitle")}</h2>
            </div>
            <p className="about-text">{t("about.sibiDesc")}</p>
          </div>

          {/* How to use */}
          <div className="about-card">
            <div className="about-card-header">
              <div
                className="about-card-icon"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  color: "#6366f1",
                }}
              >
                <Layers size={18} />
              </div>
              <h2 className="about-section-title">{t("about.howUseTitle")}</h2>
            </div>
            <ol className="about-steps-new">
              {steps.map((step, i) => (
                <li key={i} className="about-step-new">
                  <div className="about-step-num-new">{i + 1}</div>
                  <div className="about-step-icon-new">{step.icon}</div>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Right ────────────────────────────────────────────────── */}
        <div className="about-col">
          {/* Tips */}
          <div className="about-card">
            <div className="about-card-header">
              <div
                className="about-card-icon"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  color: "#f59e0b",
                }}
              >
                <Lightbulb size={18} />
              </div>
              <h2 className="about-section-title">{t("about.tipsTitle")}</h2>
            </div>
            <ul className="about-tips-new">
              {tips.map((tip, i) => (
                <li key={i} className="about-tip-new">
                  <div className="about-tip-icon">{tip.icon}</div>
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer card */}
          <div className="about-card about-dev-card">
            <div className="about-dev-banner">
              <div className="about-dev-avatar">
                <User size={28} />
              </div>
              <div>
                <p className="about-dev-name">Hafidz Putra Rachman</p>
                <p className="about-dev-role">Developer · Capstone 2025</p>
              </div>
            </div>
            <div className="about-dev-info-list">
              <div className="about-dev-info-row">
                <GraduationCap size={14} />
                <span>Teknik Komputer · Universitas Diponegoro</span>
              </div>
              <div className="about-dev-info-row">
                <Building2 size={14} />
                <span>NIM 21120120140096</span>
              </div>
            </div>
            <div className="about-capstone-box">
              <p className="about-capstone-label">CAPSTONE TITLE</p>
              <p className="about-capstone-text">
                Sistem Penerjemah Gerakan Bahasa Isyarat ke kata-kata Teks
                Menggunakan Jaringan Saraf Konvolusional dengan Arsitektur
                MobileNet berbasis Python
              </p>
            </div>
          </div>

          {/* Tech stack */}
          <div className="about-card">
            <div className="about-card-header">
              <div
                className="about-card-icon"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  color: "#10b981",
                }}
              >
                <Code2 size={18} />
              </div>
              <h2 className="about-section-title">{t("about.techTitle")}</h2>
            </div>
            <div className="about-tech-list-new">
              {techStack.map((item) => (
                <div key={item.label} className="about-tech-row-new">
                  <div
                    className="about-tech-icon"
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="about-tech-label-new">{item.label}</p>
                    <p className="about-tech-value-new">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

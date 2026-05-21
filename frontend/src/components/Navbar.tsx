import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Camera,
  Clock,
  BookOpen,
  Info,
  Settings,
  LayoutDashboard,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";
import { adminLogout } from "../api/client";
import { useLang } from "../i18n/LanguageContext";

export function Navbar() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const adminInfo = localStorage.getItem("simba_admin_info");
  const isAdmin = !!adminInfo;
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !localStorage.getItem("simba-splash-seen");
  });

  const handleCloseSplash = () => {
    localStorage.setItem("simba-splash-seen", "1");
    setShowSplash(false);
  };

  const handleLogout = async () => {
    await adminLogout();
    navigate("/");
    window.location.reload();
  };

  const links = [
    { to: "/", label: t("nav.recognizer"), icon: <Camera size={14} /> },
    { to: "/history", label: t("nav.history"), icon: <Clock size={14} /> },
    {
      to: "/dictionary",
      label: t("nav.dictionary"),
      icon: <BookOpen size={14} />,
    },
    { to: "/about", label: t("nav.about"), icon: <Info size={14} /> },
    { to: "/settings", label: t("nav.settings"), icon: <Settings size={14} /> },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => setShowSplash(true)}>
          <img src="/logo.png" alt="SIMBAsoloV3 logo" className="navbar-logo" />
          <span className="navbar-title">
            SIMBA<em>soloV3</em>
          </span>
        </div>

        <div className="navbar-links">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `navbar-link${isActive ? " navbar-link--active" : ""}`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-right">
          {/* Language switcher with flag icons */}
          <div className="lang-toggle">
            <button
              className={`lang-btn${lang === "en" ? " lang-btn--active" : ""}`}
              onClick={() => setLang("en")}
              title="English"
            >
              EN
            </button>
            <button
              className={`lang-btn${lang === "id" ? " lang-btn--active" : ""}`}
              onClick={() => setLang("id")}
              title="Bahasa Indonesia"
            >
              ID
            </button>
          </div>

          {isAdmin ? (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `navbar-link${isActive ? " navbar-link--active" : ""}`
                }
              >
                <LayoutDashboard size={14} />
                {t("nav.dashboard")}
              </NavLink>
              <button className="navbar-admin-badge" onClick={handleLogout}>
                <LogOut size={11} />
                {JSON.parse(adminInfo!).username}
              </button>
            </>
          ) : (
            <NavLink
              to="/admin/login"
              className={({ isActive }) =>
                `navbar-link${isActive ? " navbar-link--active" : ""}`
              }
            >
              <ShieldCheck size={14} />
              {t("nav.admin")}
            </NavLink>
          )}
        </div>
      </nav>

      {/* Splash Modal */}
      {showSplash && (
        <div className="splash-overlay" onClick={handleCloseSplash}>
          <div className="splash-modal" onClick={(e) => e.stopPropagation()}>
            <button className="splash-close" onClick={handleCloseSplash}>
              <X size={16} />
            </button>
            <div className="splash-hero">
              <img src="/logo.png" alt="SIMBAsoloV3" className="splash-logo" />
              <div className="splash-hero-text">
                <h1 className="splash-title">SIMBAsoloV3</h1>
                <p className="splash-tagline">
                  {lang === "id"
                    ? "Sistem Penerjemah Isyarat Bahasa Indonesia Real-Time"
                    : "Real-Time Indonesian Sign Language Translation System"}
                </p>
              </div>
            </div>
            <div className="splash-divider" />
            <p className="splash-desc">
              {lang === "id"
                ? "Aplikasi berbasis kamera yang mendeteksi dan menerjemahkan isyarat abjad SIBI (A–Z) secara real-time menggunakan Jaringan Saraf Konvolusional dengan arsitektur MobileNet."
                : "A camera-based application that detects and translates SIBI alphabet signs (A–Z) in real-time using a Convolutional Neural Network with MobileNet architecture."}
            </p>
            <div className="splash-pills">
              {(lang === "id"
                ? [
                    "🤖 CNN MobileNet",
                    "✋ MediaPipe",
                    "⚡ Real-Time",
                    "🗣️ Text-to-Speech",
                    "📖 Kamus SIBI",
                    "📊 Uji Akurasi",
                    "🌐 EN / ID",
                    "🔐 Admin Panel",
                  ]
                : [
                    "🤖 CNN MobileNet",
                    "✋ MediaPipe",
                    "⚡ Real-Time",
                    "🗣️ Text-to-Speech",
                    "📖 SIBI Dictionary",
                    "📊 Accuracy Test",
                    "🌐 EN / ID",
                    "🔐 Admin Panel",
                  ]
              ).map((pill) => (
                <span key={pill} className="splash-pill">
                  {pill}
                </span>
              ))}
            </div>
            <div className="splash-divider" />
            <div className="splash-steps">
              <p className="splash-section-label">
                {lang === "id" ? "CARA PENGGUNAAN" : "HOW TO USE"}
              </p>
              <div className="splash-step-list">
                {(lang === "id"
                  ? [
                      "Klik Mulai Kamera di halaman Penerjemah",
                      "Tunjukkan isyarat tangan SIBI ke kamera",
                      "Huruf terkonfirmasi otomatis masuk ke Pembuat Kata",
                      "Tekan Simpan Kalimat lalu Bicara untuk membacakannya",
                    ]
                  : [
                      "Click Start Camera on the Recognizer page",
                      "Show SIBI hand signs to the camera",
                      "Confirmed letters are added to the Word Builder automatically",
                      "Press Save Sentence then Speak to read it aloud",
                    ]
                ).map((step, i) => (
                  <div key={i} className="splash-step">
                    <span className="splash-step-num">{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="splash-divider" />
            <div className="splash-dev">
              <div className="splash-dev-row">
                <span className="splash-dev-label">Developer</span>
                <span className="splash-dev-value">Hafidz Putra Rachman</span>
              </div>
              <div className="splash-dev-row">
                <span className="splash-dev-label">University</span>
                <span className="splash-dev-value">Universitas Diponegoro</span>
              </div>
              <div className="splash-dev-row">
                <span className="splash-dev-label">Stack</span>
                <span className="splash-dev-value">
                  React · FastAPI · TensorFlow · SQLite
                </span>
              </div>
            </div>
            <button className="splash-cta" onClick={handleCloseSplash}>
              {lang === "id" ? "Mulai Menggunakan →" : "Get Started →"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

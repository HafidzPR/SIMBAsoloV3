import { NavLink, useNavigate } from "react-router-dom";
import { adminLogout } from "../api/client";
import { useLang } from "../i18n/LanguageContext";

export function Navbar() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const adminInfo = localStorage.getItem("simba_admin_info");
  const isAdmin = !!adminInfo;

  const handleLogout = async () => {
    await adminLogout();
    navigate("/");
    window.location.reload();
  };

  const links = [
    { to: "/", label: t("nav.recognizer") },
    { to: "/history", label: t("nav.history") },
    { to: "/dictionary", label: t("nav.dictionary") },
    { to: "/settings", label: t("nav.settings") },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-badge">S</span>
        <span className="navbar-title">
          SIMBA<em>soloV3</em>
        </span>
      </div>

      <div className="navbar-links">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `navbar-link${isActive ? " navbar-link--active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className="navbar-right">
        {/* Language toggle */}
        <div className="lang-toggle">
          <button
            className={`lang-btn${lang === "en" ? " lang-btn--active" : ""}`}
            onClick={() => setLang("en")}
            title="English"
          >
            🇬🇧
          </button>
          <button
            className={`lang-btn${lang === "id" ? " lang-btn--active" : ""}`}
            onClick={() => setLang("id")}
            title="Bahasa Indonesia"
          >
            🇮🇩
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
              {t("nav.dashboard")}
            </NavLink>
            <button className="navbar-admin-badge" onClick={handleLogout}>
              {JSON.parse(adminInfo!).username} · {t("nav.logout")}
            </button>
          </>
        ) : (
          <NavLink
            to="/admin/login"
            className={({ isActive }) =>
              `navbar-link${isActive ? " navbar-link--active" : ""}`
            }
          >
            {t("nav.admin")}
          </NavLink>
        )}
      </div>
    </nav>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminRegister } from "../api/client";
import { useLang } from "../i18n/LanguageContext";

export function AdminRegisterPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("auth.passNoMatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.passTooShort"));
      return;
    }
    setLoading(true);
    try {
      await adminRegister(username, email, password);
      navigate("/admin/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="SIMBAsoloV3" className="auth-logo-img" />
          <h1 className="auth-title">{t("auth.registerTitle")}</h1>
          <p className="auth-subtitle">{t("auth.registerSubtitle")}</p>
        </div>
        {error && <p className="error-banner">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">{t("auth.username")}</label>
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("auth.usernamePlaceholder")}
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">{t("auth.email")}</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">{t("auth.password")}</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">{t("auth.confirmPassword")}</label>
            <input
              className="auth-input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t("auth.confirmPlaceholder")}
              required
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? t("auth.creating") : t("auth.createAccount")}
          </button>
        </form>
        <p className="auth-footer">
          {t("auth.hasAccount")}{" "}
          <Link to="/admin/login" className="auth-link">
            {t("auth.loginHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}

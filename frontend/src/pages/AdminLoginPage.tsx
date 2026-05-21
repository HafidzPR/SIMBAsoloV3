import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin } from "../api/client";
import { useLang } from "../i18n/LanguageContext";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, admin } = await adminLogin(username, password);
      localStorage.setItem("simba_admin_token", token);
      localStorage.setItem("simba_admin_info", JSON.stringify(admin));
      navigate("/admin/dashboard");
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
          <div className="auth-logo">S</div>
          <h1 className="auth-title">{t("auth.loginTitle")}</h1>
          <p className="auth-subtitle">{t("auth.loginSubtitle")}</p>
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
              placeholder={t("auth.loginUserPlaceholder")}
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">{t("auth.password")}</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.loginPassPlaceholder")}
              required
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? t("auth.loggingIn") : t("auth.login")}
          </button>
        </form>
        <p className="auth-footer">
          {t("auth.noAccount")}{" "}
          <Link to="/admin/register" className="auth-link">
            {t("auth.registerHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}

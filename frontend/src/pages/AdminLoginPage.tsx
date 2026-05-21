import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin } from "../api/client";

export function AdminLoginPage() {
  const navigate = useNavigate();
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
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">SIMBAsoloV3 · Dashboard Access</p>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          No account?{" "}
          <Link to="/admin/register" className="auth-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

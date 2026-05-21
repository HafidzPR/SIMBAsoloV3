import { NavLink, useNavigate } from "react-router-dom";
import { adminLogout } from "../api/client";

const links = [
  { to: "/", label: "Recognizer" },
  { to: "/history", label: "History" },
  { to: "/dictionary", label: "Dictionary" },
  { to: "/settings", label: "Settings" },
];

export function Navbar() {
  const navigate = useNavigate();
  const adminInfo = localStorage.getItem("simba_admin_info");
  const isAdmin = !!adminInfo;

  const handleLogout = async () => {
    await adminLogout();
    navigate("/");
    window.location.reload();
  };

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
        {isAdmin ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `navbar-link${isActive ? " navbar-link--active" : ""}`
              }
            >
              Dashboard
            </NavLink>
            <button className="navbar-admin-badge" onClick={handleLogout}>
              {JSON.parse(adminInfo!).username} · Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/admin/login"
            className={({ isActive }) =>
              `navbar-link${isActive ? " navbar-link--active" : ""}`
            }
          >
            Admin
          </NavLink>
        )}
      </div>
    </nav>
  );
}

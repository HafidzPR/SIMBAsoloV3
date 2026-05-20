import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Recognizer" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
];

export function Navbar() {
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
              `navbar-link ${isActive ? "navbar-link--active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
      <div className="navbar-tag">SIBI · A–Z</div>
    </nav>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logoCircle from "../assets/logo-circle.jpg";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const user = JSON.parse(localStorage.getItem("society_user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("society_user");
    window.location.href = "/login";
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img
            src={logoCircle}
            alt="Aura Heights Logo"
            className="nav-logo-img"
            style={{ width: "40px", height: "40px", borderRadius: "50%", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          />
          <span className="nav-logo-text">
            Aura<span>Heights</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          {[
            { path: "/", label: "Home" },
            { path: "/about", label: "About" },
            { path: "/services", label: "Services" },
            { path: "/flats", label: "Flats" },
            { path: "/notices", label: "Notices" },
            { path: "/contact", label: "Contact" },
            { path: "/complaints", label: "Complaints" },
            ...(user ? [
              { path: "/my-bookings", label: "My Bookings" }
            ] : [])
          ].map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`nav-link ${isActive(path) ? "active" : ""}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="nav-actions">
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                👋 {user.uname}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            style={{
              transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "",
            }}
          />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span
            style={{
              transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "",
            }}
          />
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 70,
            left: 0,
            right: 0,
            background: "rgba(10,14,26,0.98)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 24px 24px",
            zIndex: 899,
            animation: "slideDown 0.2s ease",
          }}
        >
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { path: "/", label: "🏠 Home" },
              { path: "/about", label: "ℹ️ About" },
              { path: "/services", label: "✨ Services" },
              { path: "/flats", label: "🏢 Flats" },
              { path: "/notices", label: "📌 Notices" },
              { path: "/contact", label: "📞 Contact" },
              { path: "/complaints", label: "📝 Complaints" },
              ...(user ? [
                { path: "/my-bookings", label: "🔑 My Bookings" }
              ] : [])
            ].map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    color: isActive(path) ? "var(--primary-light)" : "var(--text-secondary)",
                    background: isActive(path) ? "rgba(99,102,241,0.1)" : "transparent",
                    fontWeight: 500,
                    fontSize: 15,
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {user ? (
              <button className="btn btn-secondary btn-sm w-full" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

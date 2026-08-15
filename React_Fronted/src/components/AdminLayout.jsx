import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/admin/users", icon: "👥", label: "Residents" },
  { path: "/admin/flats", icon: "🏢", label: "Flats" },
  { path: "/admin/bookings", icon: "📋", label: "Bookings" },
  { path: "/admin/notices", icon: "📌", label: "Notices" },
  { path: "/admin/complaints", icon: "📝", label: "Complaints" },
  { path: "/admin/contacts", icon: "💬", label: "Messages" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin_data") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    navigate("/admin/login");
  };

  return (
    <div className="admin-wrapper">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 799,
            display: "none",
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <div className="sidebar-logo">🏢</div>
          <div className="sidebar-brand">
            <h3>Aura Heights</h3>
            <p>Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <p className="sidebar-nav-label">Main Menu</p>
            {navItems.map(({ path, icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? "active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-nav-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="sidebar-nav-section">
            <p className="sidebar-nav-label">System</p>
            <NavLink to="/" className="sidebar-nav-item">
              <span className="sidebar-nav-icon">🌐</span>
              View Website
            </NavLink>
            <button
              className="sidebar-nav-item"
              style={{ width: "100%", textAlign: "left", background: "none", color: "var(--danger)", cursor: "pointer" }}
              onClick={handleLogout}
            >
              <span className="sidebar-nav-icon">🚪</span>
              Logout
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {(admin.username || "A")[0].toUpperCase()}
            </div>
            <div>
              <div className="admin-name">{admin.username || "Admin"}</div>
              <div className="admin-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: 22,
                cursor: "pointer",
                display: "none",
              }}
              className="sidebar-toggle"
            >
              ☰
            </button>
          </div>

          <div className="admin-topbar-right">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: "var(--bg-glass)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)",
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <span>👤</span>
              <span>{admin.username || "Admin"}</span>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
              style={{ borderRadius: "var(--radius-full)" }}
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

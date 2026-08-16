import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logoSquare from "../../assets/logo-square.jpg";

const API = "https://auraheight.onrender.com";

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/admin/login`, form);
      if (res.data.flag === 1) {
        localStorage.setItem("admin_token", res.data.token);
        localStorage.setItem("admin_data", JSON.stringify(res.data.admin));
        navigate("/admin/dashboard");
      } else {
        setError(res.data.message || "Invalid admin credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* —— LEFT PANEL —— */}
      <div className="auth-panel-left">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />

        <div className="auth-panel-left-inner">
          {/* Logo card */}
          <div className="auth-logo-card">
            <img src={logoSquare} alt="Aura Heights" className="auth-logo-img" />
          </div>

          <h2 className="auth-society-name">Aura Heights</h2>
          <p className="auth-society-sub">Co-Operative Housing Society Ltd.</p>

          <h1 className="auth-panel-heading">Admin Portal ðŸ›¡ï¸</h1>
          <p className="auth-panel-desc">
            Restricted access for authorized administrators only. Manage residents, flats, bookings, and society operations.
          </p>

          <div className="auth-badges">
            <span className="auth-badge">ðŸ‘¥ Manage Residents</span>
            <span className="auth-badge">ðŸ¢ Flat Oversight</span>
            <span className="auth-badge">ðŸ“Š Booking Control</span>
            <span className="auth-badge">🔔 Send Notices</span>
          </div>
        </div>
      </div>

      {/* —— RIGHT PANEL —— */}
      <div className="auth-panel-right">
        <div className="auth-form-card">
          <Link to="/login" className="auth-back-link">← Back to User Login</Link>

          <h2 className="auth-form-title">Admin Sign In</h2>
          <p className="auth-form-subtitle">Enter your administrator credentials</p>

          {/* Restricted access notice */}
          <div className="auth-notice-box">
            ⚠️ Restricted Access — Authorized personnel only
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">👤</span> Admin Username
              </label>
              <input
                className="auth-input"
                type="text"
                placeholder="admin"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">ðŸ”</span> Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="auth-eye-btn"
                >
                  {showPass ? "🙈" : "ðŸ‘"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          
              </p>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                  Authenticating...
                </span>
              ) : "ðŸ›¡ï¸ Access Admin Panel"}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: 20 }}>
            Not an admin?{" "}
            <Link to="/login" className="auth-footer-link">Go to User Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

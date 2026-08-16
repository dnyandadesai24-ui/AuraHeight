import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logoSquare from "../assets/logo-square.jpg";

const API = "https://auraheight.onrender.com";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/login`, form);
      if (res.data.flag === 1) {
        localStorage.setItem("society_user", JSON.stringify(res.data));
        const pendingFlat = localStorage.getItem("pending_booking_flat_id");
        if (pendingFlat) {
          navigate("/flats");
        } else {
          navigate("/");
        }
      } else {
        setError(res.data.message || "Invalid credentials");
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
        {/* Decorative blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />

        <div className="auth-panel-left-inner">
          {/* Logo card — white square with shadow like reference */}
          <div className="auth-logo-card">
            <img src={logoSquare} alt="Aura Heights" className="auth-logo-img" />
          </div>

          <h2 className="auth-society-name">Aura Heights</h2>
          <p className="auth-society-sub">Co-Operative Housing Society Ltd.</p>

          <h1 className="auth-panel-heading">Welcome Back! 👋</h1>
          <p className="auth-panel-desc">
            Sign in to manage your flat, track bookings, and stay connected with your community.
          </p>

          {/* Feature pill badges */}
          <div className="auth-badges">
            <span className="auth-badge">ðŸ  Flat Management</span>
            <span className="auth-badge">📋 Booking Tracker</span>
            <span className="auth-badge">🔔 Notice Board</span>
            <span className="auth-badge">🔒 Secure Access</span>
          </div>
        </div>
      </div>

      {/* —— RIGHT PANEL —— */}
      <div className="auth-panel-right">
        <div className="auth-form-card">
          <Link to="/" className="auth-back-link">← Back to Home</Link>

          <h2 className="auth-form-title">Sign In</h2>
          <p className="auth-form-subtitle">Enter your credentials to access your account</p>

          {error && (
            <div className="auth-alert auth-alert-error">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">✉️</span> Email Address
              </label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                <span className="auth-label-icon">🔒</span> Password
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
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="auth-eye-btn"
                >
                  {showPass ? "🙈" : "ðŸ‘"}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                  Signing in...
                </span>
              ) : "🚀 Sign In"}
            </button>
          </form>

          <div className="auth-divider-line"><span>OR</span></div>

          <Link to="/admin/login" className="auth-secondary-btn">
            ðŸ›¡ï¸ Admin Login
          </Link>

          <p className="auth-footer-text">
            Don't have an account?{" "}
            <Link to="/register" className="auth-footer-link">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

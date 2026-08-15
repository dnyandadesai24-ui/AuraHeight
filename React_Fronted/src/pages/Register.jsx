import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logoSquare from "../assets/logo-square.jpg";

const API = "https://auraheight.onrender.com";

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
    role: "Resident",
    resident_type: "Owner",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      return setError("Passwords do not match!");
    }
    setLoading(true);
    setError("");
    try {
      const { confirm_password, ...payload } = form;
      await axios.post(`${API}/register`, payload);
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* â”€â”€ LEFT PANEL â”€â”€ */}
      <div className="auth-panel-left">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />

        <div className="auth-panel-left-inner">
          <div className="auth-logo-card">
            <img src={logoSquare} alt="Aura Heights" className="auth-logo-img" />
          </div>

          <h2 className="auth-society-name">Aura Heights</h2>
          <p className="auth-society-sub">Co-Operative Housing Society Ltd.</p>

          <h1 className="auth-panel-heading">Let's Get You Started! âœ¨</h1>
          <p className="auth-panel-desc">
            Create your free account and access your residential portal, book flats, and connect with your community.
          </p>

          <div className="auth-badges">
            <span className="auth-badge">âœ… Free Registration</span>
            <span className="auth-badge">ðŸ“¬ Email Confirmation</span>
            <span className="auth-badge">ðŸŒŸ Full Portal Access</span>
            <span className="auth-badge">ðŸ¡ Society Services</span>
          </div>
        </div>
      </div>

      {/* â”€â”€ RIGHT PANEL â”€â”€ */}
      <div className="auth-panel-right auth-panel-right-scroll">
        <div className="auth-form-card auth-form-card-wide">
          <Link to="/" className="auth-back-link">â† Back to Home</Link>

          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-subtitle">Fill in the details below to get started</p>

          {error && <div className="auth-alert auth-alert-error">âš ï¸ {error}</div>}
          {success && <div className="auth-alert auth-alert-success">âœ… {success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-field">
              <label className="auth-label"><span className="auth-label-icon">ðŸ‘¤</span> Full Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Enter your full name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </div>

            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Mobile</label>
                <input
                  className="auth-input"
                  type="tel"
                  placeholder="9876543210"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label"><span className="auth-label-icon">âœ‰</span> Email Address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="auth-label">Role</label>
                <select
                  className="auth-input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Resident">Resident</option>
                  <option value="Manager">Manager</option>
                  <option value="Security">Security</option>
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-label">Resident Type</label>
                <select
                  className="auth-input"
                  value={form.resident_type}
                  onChange={(e) => setForm({ ...form, resident_type: e.target.value })}
                >
                  <option value="Owner">Owner</option>
                  <option value="Tenant">Tenant</option>
                </select>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label"><span className="auth-label-icon">ðŸ”’</span> Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="auth-eye-btn"
                >
                  {showPass ? "ðŸ™ˆ" : "ðŸ‘"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Repeat your password"
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                  Creating account...
                </span>
              ) : "ðŸš€ Create My Account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-footer-link">Sign in instead â†’</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

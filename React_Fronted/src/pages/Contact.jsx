import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "https://auraheight.onrender.com";

export default function Contact() {
  const [form, setForm] = useState({ Name: "", Email: "", Subject: "", Message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API}/contact`, form);
      setSuccess("âœ… Your message has been sent successfully! We'll get back to you soon.");
      setForm({ Name: "", Email: "", Subject: "", Message: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: "ðŸ“§", label: "Email", value: "admin@auraheights.com", link: "mailto:admin@auraheights.com" },
    { icon: "ðŸ“ž", label: "Phone", value: "+91 98765 43210", link: "tel:+919876543210" },
    { icon: "ðŸ“", label: "Location", value: "123 Horizon Ave, Sector 45", link: "#" },
    { icon: "ðŸ•’", label: "Office Hours", value: "Monâ€“Sat, 9AM â€“ 6PM", link: "#" },
  ];

  return (
    <>
      <Navbar />

      {/* Header */}
      <section
        style={{
          paddingTop: 120,
          paddingBottom: 60,
          background: "var(--gradient-hero)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(8,145,178,0.13) 0%, transparent 70%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-tag" style={{ justifyContent: "center" }}>ðŸ“ž Contact Us</div>
          <h1 className="section-title">
            Get in <span>Touch</span>
          </h1>
          <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            Have questions about flat booking, maintenance, or society services? We're here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: "80px 0", background: "var(--bg-primary)" }}>
        <div className="container">
          <div className="contact-grid">
            {/* Info */}
            <div>
              <div className="contact-info-card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: "var(--text-primary)" }}>
                  Contact Information
                </h3>
                {contactInfo.map((item, i) => (
                  <div className="contact-info-item" key={i}>
                    <div className="contact-icon">{item.icon}</div>
                    <div className="contact-info-text">
                      <h4>{item.label}</h4>
                      <a href={item.link} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                        {item.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social */}
              <div className="contact-info-card">
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
                  Follow Us
                </h4>
                <div style={{ display: "flex", gap: 12 }}>
                  {["ðŸ¦ Twitter", "ðŸ“˜ Facebook", "ðŸ“· Instagram"].map((s, i) => (
                    <a
                      key={i}
                      href="#"
                      style={{
                        padding: "8px 14px",
                        background: "var(--bg-glass)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-full)",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        transition: "var(--transition)",
                      }}
                    >
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div
              style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: 36,
              }}
            >
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Send a Message</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>
                Fill out the form and our team will respond within 24 hours.
              </p>

              {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
              {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="John Doe"
                      value={form.Name}
                      onChange={(e) => setForm({ ...form, Name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="john@email.com"
                      value={form.Email}
                      onChange={(e) => setForm({ ...form, Email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Flat booking inquiry, maintenance request..."
                    value={form.Subject}
                    onChange={(e) => setForm({ ...form, Subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-input"
                    placeholder="Describe your query in detail..."
                    rows={5}
                    value={form.Message}
                    onChange={(e) => setForm({ ...form, Message: e.target.value })}
                    required
                    style={{ resize: "vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: "100%", padding: "14px" }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Sending...
                    </span>
                  ) : (
                    "ðŸ“¤ Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

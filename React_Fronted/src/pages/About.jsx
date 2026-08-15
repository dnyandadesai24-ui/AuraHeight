import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const values = [
  { icon: "🎯", title: "Mission", desc: "To simplify society management with technology that empowers communities and enriches resident experience." },
  { icon: "🌟", title: "Vision", desc: "A world where every residential society runs smoothly, transparently, and with a sense of true community." },
  { icon: "💡", title: "Innovation", desc: "Continuously improving our platform with the latest technology to serve our residents better every day." },
  { icon: "🤝", title: "Community", desc: "Building stronger bonds between residents, management, and owners through open communication and trust." },
];

const team = [
  { name: "Dnyanda Desai", role: "Lead Developer", avatar: "D", color: "#0891b2" },
  { name: "Society Admin", role: "System Administrator", avatar: "A", color: "#0284c7" },
  { name: "Tech Team", role: "Backend Engineers", avatar: "T", color: "#f59e0b" },
  { name: "Design Team", role: "UI/UX Designers", avatar: "D", color: "#10b981" },
];

const milestones = [
  { year: "2023", event: "Project initiated for Aura Heights Residency" },
  { year: "2024", event: "Flat & Booking Management system launched" },
  { year: "2025", event: "AI Chatbot & resident portal integrated" },
  { year: "2026", event: "Full admin dashboard & analytics released" },
];

export default function About() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="about-hero">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at top, rgba(8,145,178,0.16) 0%, transparent 70%)",
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-tag" style={{ justifyContent: "center" }}>ℹ️ About Us</div>
          <h1 className="section-title">
            We're Building the Future of
            <br />
            <span>Society Management</span>
          </h1>
          <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            Aura Heights Residency was founded with a simple idea — making residential community management accessible, transparent, and enjoyable for everyone.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "80px 0", background: "var(--bg-primary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>🎯 Our Values</div>
            <h2 className="section-title">What Drives Us</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {values.map((v, i) => (
              <div className="feature-card" key={i} style={{ textAlign: "center" }}>
                <div className="feature-icon" style={{ margin: "0 auto 20px", background: "rgba(8,145,178,0.12)" }}>
                  {v.icon}
                </div>
                <h3 className="feature-title">{v.title}</h3>
                <p className="feature-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: "80px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>📅 Our Journey</div>
            <h2 className="section-title">Key <span>Milestones</span></h2>
          </div>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
            {milestones.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 24,
                  paddingBottom: i < milestones.length - 1 ? 32 : 0,
                  position: "relative",
                }}
              >
                {/* Line */}
                {i < milestones.length - 1 && (
                  <div style={{ position: "absolute", left: 43, top: 44, bottom: 0, width: 2, background: "var(--border)" }} />
                )}
                {/* Year bubble */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 88, height: 44, background: "var(--gradient-primary)",
                    borderRadius: "var(--radius-full)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 15, color: "white",
                  }}>
                    {m.year}
                  </div>
                </div>
                {/* Content */}
                <div style={{
                  background: "var(--bg-glass)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "14px 20px",
                  flex: 1,
                }}>
                  <p style={{ color: "var(--text-primary)", fontSize: 15 }}>{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "80px 0", background: "var(--bg-primary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>👥 Our Team</div>
            <h2 className="section-title">Meet the <span>People</span> Behind It</h2>
          </div>
          <div className="team-grid">
            {team.map((member, i) => (
              <div className="team-card" key={i}>
                <div className="team-avatar" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}99)` }}>
                  {member.avatar}
                </div>
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "60px 0", background: "var(--gradient-primary)" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 32,
            textAlign: "center",
          }}>
            {[
              { num: "500+", label: "Residents Served" },
              { num: "120+", label: "Flats Managed" },
              { num: "4", label: "Wings Covered" },
              { num: "24/7", label: "Support Available" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 40, fontWeight: 900, color: "white" }}>{s.num}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

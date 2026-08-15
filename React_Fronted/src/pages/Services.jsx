import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Services() {
  const facilities = [
    { icon: "🏊‍♂️", title: "Swimming Pool", desc: "Temperature controlled olympic size swimming pool." },
    { icon: "🏋️‍♀️", title: "Gymnasium", desc: "Fully equipped modern fitness center." },
    { icon: "🌳", title: "Landscaped Gardens", desc: "Lush green walking tracks and sitting areas." },
    { icon: "🛡️", title: "24/7 Security", desc: "CCTV surveillance and manned security gates." },
    { icon: "⚡", title: "Power Backup", desc: "100% power backup for common areas and flats." },
    { icon: "🎉", title: "Clubhouse", desc: "Spacious community hall for events and parties." },
    { icon: "🚗", title: "Covered Parking", desc: "Dedicated multi-level parking for residents." },
    { icon: "🏸", title: "Sports Courts", desc: "Badminton, tennis, and basketball courts." }
  ];

  return (
    <>
      <Navbar />
      <section
        style={{
          paddingTop: 120,
          paddingBottom: 60,
          background: "var(--gradient-hero)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-tag" style={{ justifyContent: "center" }}>✨ World Class Amenities</div>
          <h1 className="section-title">
            Our <span>Services & Facilities</span>
          </h1>
          <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            Experience premium living at Aura Heights Residency with our state-of-the-art facilities.
          </p>
        </div>
      </section>

      <section style={{ padding: "80px 0", background: "var(--bg-primary)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30 }}>
            {facilities.map((fac, i) => (
              <div 
                key={i} 
                style={{
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "30px 24px",
                  textAlign: "center",
                  transition: "transform 0.3s ease",
                  cursor: "default"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{fac.icon}</div>
                <h3 style={{ fontSize: 20, marginBottom: 12, color: "var(--text-primary)" }}>{fac.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6 }}>{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

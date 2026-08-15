import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import logoCircle from "../assets/logo-circle.jpg";

const features = [
  {
    icon: "🏢",
    title: "Flat Management",
    desc: "Browse, book, and manage residential flats with real-time availability updates and detailed information.",
    color: "#0891b2",
  },
  {
    icon: "👥",
    title: "Resident Portal",
    desc: "Seamless registration and profile management for all society residents — owners and tenants alike.",
    color: "#0284c7",
  },
  {
    icon: "📋",
    title: "Booking System",
    desc: "Hassle-free flat booking with multiple payment options and instant confirmation notifications.",
    color: "#f59e0b",
  },
  {
    icon: "🔒",
    title: "Secure Platform",
    desc: "Enterprise-grade security with encrypted credentials and role-based access control.",
    color: "#10b981",
  },
  {
    icon: "📱",
    title: "Admin Dashboard",
    desc: "Powerful admin panel with real-time analytics, user management, and comprehensive reports.",
    color: "#22d3ee",
  },
  {
    icon: "🤖",
    title: "Smart Chatbot",
    desc: "AI-powered assistant available 24/7 to answer queries and guide residents through processes.",
    color: "#0e7490",
  },
];

export default function Home() {
  const [count, setCount] = useState({ users: 0, flats: 0, bookings: 0 });

  useEffect(() => {
    // Animate counters
    const targets = { users: 500, flats: 120, bookings: 300 };
    const duration = 2000;
    const steps = 60;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount({
        users: Math.floor(targets.users * eased),
        flats: Math.floor(targets.flats * eased),
        bookings: Math.floor(targets.bookings * eased),
      });

      if (step >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-glow hero-bg-glow-1" />
        <div className="hero-bg-glow hero-bg-glow-2" />
        {/* Watermark logo in background */}
        <img src={logoCircle} alt="" className="hero-logo-watermark" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-badge animate-glow">
            ✨ Next-Generation Society Management
          </div>

          <h1 className="hero-title">
            Manage Your Society
            <br />
            <span>Smarter & Faster</span>
          </h1>

          <p className="hero-subtitle">
            A powerful, all-in-one platform for modern residential societies. Simplify flat management, resident registration, and community administration.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              🚀 Get Started Free
            </Link>
            <Link to="/flats" className="btn btn-secondary btn-lg">
              🏢 View Flats
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{count.users}+</div>
              <div className="hero-stat-label">Happy Residents</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-value">{count.flats}+</div>
              <div className="hero-stat-label">Managed Flats</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-value">{count.bookings}+</div>
              <div className="hero-stat-label">Successful Bookings</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <div className="section-tag">⚡ Features</div>
            <h2 className="section-title">
              Everything You Need to
              <br />
              <span>Run Your Society</span>
            </h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              From flat bookings to admin analytics — we've built every tool your society needs in one beautiful platform.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div
                  className="feature-icon"
                  style={{ background: `${f.color}20` }}
                >
                  {f.icon}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 0",
          background: "var(--gradient-primary)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              color: "white",
              marginBottom: 16,
            }}
          >
            Ready to Join Aura Heights?
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 36,
              maxWidth: 500,
              margin: "0 auto 36px",
            }}
          >
            Register today and experience the future of residential society management.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/register"
              style={{
                padding: "14px 32px",
                background: "white",
                color: "var(--primary)",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                transition: "var(--transition)",
              }}
            >
              🚀 Register Now
            </Link>
            <Link
              to="/contact"
              style={{
                padding: "14px 32px",
                background: "transparent",
                border: "2px solid white",
                color: "white",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
              }}
            >
              📞 Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

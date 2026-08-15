import { Link } from "react-router-dom";
import logoCircle from "../assets/logo-circle.jpg";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="nav-logo">
              <img src={logoCircle} alt="Aura Heights Logo" style={{ width: 36, height: 36, borderRadius: "50%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
              <span className="nav-logo-text">
                Aura<span>Heights</span>
              </span>
            </Link>
            <p>
              A modern society management platform that simplifies residential living with smart tools for flat management, bookings, and community services.
            </p>
            <div className="social-links" style={{ marginTop: 20 }}>
              {["🐦", "📘", "📷", "💼"].map((icon, i) => (
                <a key={i} href="#" className="social-link">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">→ Home</Link></li>
              <li><Link to="/about">→ About Us</Link></li>
              <li><Link to="/services">→ Services</Link></li>
              <li><Link to="/flats">→ Available Flats</Link></li>
              <li><Link to="/notices">→ Notice Board</Link></li>
              <li><Link to="/contact">→ Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4>Services</h4>
            <ul className="footer-links">
              <li><a href="#">→ Flat Booking</a></li>
              <li><a href="#">→ Maintenance</a></li>
              <li><a href="#">→ Community Events</a></li>
              <li><a href="#">→ Security</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="footer-links">
              <li><a href="mailto:admin@auraheights.com">📧 admin@auraheights.com</a></li>
              <li><a href="tel:+919876543210">📞 +91 98765 43210</a></li>
              <li><a href="#">📍 123 Horizon Avenue, Tech City, Sector 45</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {year} Aura Heights Residency. All rights reserved.</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Built with ❤️ for modern living
          </p>
        </div>
      </div>
    </footer>
  );
}

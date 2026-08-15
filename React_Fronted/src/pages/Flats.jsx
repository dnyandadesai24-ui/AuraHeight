import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "http://localhost:3000";

const TYPE_COLORS = {
  "1BHK": "#0891b2",
  "2BHK": "#0284c7",
  "3BHK": "#f59e0b",
  "Studio": "#10b981",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ wing: "", type: "", status: "" });
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => { fetchFlats(); }, []);

  useEffect(() => {
    let data = [...flats];
    if (filters.wing) data = data.filter((f) => f.Wing === filters.wing);
    if (filters.type) data = data.filter((f) => f.Flat_Type === filters.type);
    if (filters.status) data = data.filter((f) => f.Status === filters.status);
    setFiltered(data);
    setPage(1);
  }, [filters, flats]);

  useEffect(() => {
    const pendingFlat = localStorage.getItem("pending_booking_flat_id");
    if (pendingFlat && filtered.length > 0) {
      const index = filtered.findIndex((f) => String(f.Flat_ID) === pendingFlat);
      if (index !== -1) {
        const requiredPage = Math.floor(index / limit) + 1;
        if (page !== requiredPage) {
          setPage(requiredPage);
        }
      }
    }
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/flats`);
      setFlats(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const wings = [...new Set(flats.map((f) => f.Wing))];
  const types = [...new Set(flats.map((f) => f.Flat_Type))];

  return (
    <>
      <Navbar />

      {/* Header */}
      <section style={{ paddingTop: 120, paddingBottom: 60, background: "var(--gradient-hero)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(8,145,178,0.14) 0%, transparent 70%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-tag" style={{ justifyContent: "center" }}>🏢 Available Flats</div>
          <h1 className="section-title">Find Your Perfect <span>Home</span></h1>
          <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            Browse our curated selection of residential flats. Filter by wing, type, or availability.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: "32px 0", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 600 }}>Filter:</span>
            <select className="form-input" style={{ width: "auto", minWidth: 130 }} value={filters.wing} onChange={(e) => setFilters({ ...filters, wing: e.target.value })}>
              <option value="">All Wings</option>
              {wings.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <select className="form-input" style={{ width: "auto", minWidth: 130 }} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="form-input" style={{ width: "auto", minWidth: 140 }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Booked">Booked</option>
            </select>
            {(filters.wing || filters.type || filters.status) && (
              <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ wing: "", type: "", status: "" })}>✕ Clear</button>
            )}
            <span style={{ marginLeft: "auto", fontSize: 14, color: "var(--text-muted)" }}>
              {filtered.length} flat{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>
      </section>

      {/* Flats Grid */}
      <section style={{ padding: "60px 0 160px 0", background: "var(--bg-primary)", minHeight: 400 }}>
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading flats...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🏠</div>
              <h3 style={{ color: "var(--text-secondary)", fontSize: 20 }}>No flats found</h3>
              <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {paginated.map((flat) => (
                <FlatCard key={flat.Flat_ID} flat={flat} onBooked={fetchFlats} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pagination" style={{ padding: "32px 0", justifyContent: "center" }}>
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`page-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

// ─── Flat Card with Booking Modal ─────────────────────────────────────────────
function FlatCard({ flat, onBooked }) {
  const [showModal, setShowModal] = useState(false);
  const [paymentType, setPaymentType] = useState("Online");
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState(null);

  const accentColor = TYPE_COLORS[flat.Flat_Type] || "#0891b2";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBookNow = () => {
    console.log("handleBookNow called for Flat_ID:", flat.Flat_ID);
    const userData = localStorage.getItem("society_user");
    if (!userData) {
      console.log("No userData found. Redirecting to login...");
      // Not logged in — save flat intent and send to login
      localStorage.setItem("pending_booking_flat_id", String(flat.Flat_ID));
      window.location.href = "/login";
      return;
    }
    console.log("userData found. Opening modal...");
    setPaymentType("Online");
    setShowModal(true);
  };

  useEffect(() => {
    const pendingFlat = localStorage.getItem("pending_booking_flat_id");
    if (pendingFlat === String(flat.Flat_ID)) {
      const userData = localStorage.getItem("society_user");
      if (userData) {
        setShowModal(true);
        localStorage.removeItem("pending_booking_flat_id");
      }
    }
  }, [flat.Flat_ID]);

  const handleConfirmBooking = async () => {
    let userData;
    try {
      userData = JSON.parse(localStorage.getItem("society_user"));
    } catch {
      showToast("Session error. Please log in again.", "error");
      setShowModal(false);
      return;
    }

    // Handle various shapes of stored user data — login API returns uid
    const userId =
      userData?.uid ||
      userData?.user?.User_ID ||
      userData?.user?.id ||
      userData?.User_ID ||
      userData?.id;

    if (!userId) {
      showToast("Session expired. Please log in again.", "error");
      setShowModal(false);
      return;
    }

    setBooking(true);
    try {
      await axios.post(`${API}/bookings`, {
        User_ID: userId,
        Flat_ID: flat.Flat_ID,
        Payment_Type: paymentType,
      });
      setShowModal(false);
      showToast("🎉 Flat booked! Admin will confirm your booking shortly.");
      onBooked(); // refresh list so flat shows as Booked
    } catch (err) {
      showToast(err.response?.data?.message || "Booking failed. Please try again.", "error");
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 30, right: 30, zIndex: 9999,
          background: toast.type === "error" ? "rgba(239,68,68,0.95)" : "rgba(16,185,129,0.95)",
          color: "#fff", padding: "14px 24px", borderRadius: 12,
          fontWeight: 600, fontSize: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          animation: "slideUp 0.3s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9000,
            background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 20, padding: 36,
            maxWidth: 460, width: "100%",
            animation: "slideUp 0.3s ease",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 54, height: 54, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
              }}>
                🏠
              </div>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  Confirm Booking
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
                  Flat {flat.Flat_No} &nbsp;·&nbsp; Wing {flat.Wing} &nbsp;·&nbsp; Floor {flat.Floor_No}
                </p>
              </div>
            </div>

            {/* Flat Details Grid */}
            <div style={{
              background: "var(--bg-glass)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "14px 18px", marginBottom: 22,
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px",
            }}>
              {[
                { label: "Type", value: flat.Flat_Type },
                { label: "Area", value: `${flat.Area_Sqft} sq.ft` },
                { label: "Maintenance", value: `₹${Number(flat.Maintenance_Amount).toLocaleString()}/mo` },
                { label: "Status", value: flat.Status },
              ].map((d, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{d.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{d.value}</div>
                </div>
              ))}
            </div>

            {/* Payment Type Selector */}
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
                Select Payment Type
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                {["Online", "Cash", "Cheque", "EMI"].map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPaymentType(pt)}
                    style={{
                      padding: "10px 4px", borderRadius: 10,
                      border: `2px solid ${paymentType === pt ? accentColor : "var(--border)"}`,
                      background: paymentType === pt ? `${accentColor}22` : "transparent",
                      color: paymentType === pt ? accentColor : "var(--text-muted)",
                      fontWeight: 700, fontSize: 13, cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: 14 }}
                onClick={() => setShowModal(false)}
                disabled={booking}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: 14 }}
                onClick={handleConfirmBooking}
                disabled={booking}
              >
                {booking ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Booking...
                  </span>
                ) : "✅ Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flat Card */}
      <div className="flat-card">
        <div
          className="flat-card-header"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }}
        >
          <div>
            <div className="flat-number">Flat {flat.Flat_No}</div>
            <div className="flat-wing">Wing {flat.Wing} · Floor {flat.Floor_No}</div>
          </div>
          <span
            className={`badge ${flat.Status === "Available" ? "badge-success" : flat.Status === "Pending" ? "badge-warning" : "badge-danger"}`}
            style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            {flat.Status}
          </span>
        </div>

        <div className="flat-card-body">
          <div className="flat-info-row">
            <span className="flat-info-label">Type</span>
            <span className="flat-info-value">{flat.Flat_Type}</span>
          </div>
          <div className="flat-info-row">
            <span className="flat-info-label">Area</span>
            <span className="flat-info-value">{flat.Area_Sqft} Sq.ft</span>
          </div>
          <div className="flat-info-row">
            <span className="flat-info-label">Maintenance</span>
            <span className="flat-info-value" style={{ color: "var(--accent)" }}>
              ₹{Number(flat.Maintenance_Amount).toLocaleString()}/mo
            </span>
          </div>
        </div>

        <div className="flat-card-footer">
          <span className={`badge ${flat.Status === "Available" ? "badge-success" : flat.Status === "Pending" ? "badge-warning" : "badge-danger"}`}>
            {flat.Status === "Available" ? "✅ Available" : flat.Status === "Pending" ? "⏳ Pending" : "🔒 Booked"}
          </span>
          {flat.Status === "Available" && (
            <button className="btn btn-primary btn-sm" onClick={handleBookNow}>
              Book Now
            </button>
          )}
        </div>
      </div>
    </>
  );
}

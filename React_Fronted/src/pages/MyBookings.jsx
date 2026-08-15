import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "https://auraheight.onrender.com";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 6;
  
  const user = JSON.parse(localStorage.getItem("society_user"));

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const totalPages = Math.ceil(bookings.length / limit);
  const paginated = bookings.slice((page - 1) * limit, page * limit);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API}/user-bookings/${user.uid}`);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

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
          <div className="section-tag" style={{ justifyContent: "center" }}>ðŸ”‘ Dashboard</div>
          <h1 className="section-title">
            My <span>Bookings</span>
          </h1>
          <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            Track the status of your flat bookings.
          </p>
        </div>
      </section>

      <section style={{ padding: "60px 0", background: "var(--bg-primary)", minHeight: "50vh" }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}><div className="spinner"></div></div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, background: "var(--bg-glass)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>ðŸ </div>
              <h3 style={{ color: "var(--text-primary)" }}>You haven't booked any flats yet.</h3>
            </div>
          ) : (
            <div className="grid">
              {paginated.map(booking => (
                <div key={booking.Booking_ID} className="flat-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 24, margin: 0, color: "var(--text-primary)" }}>
                      Flat {booking.Flat_No}
                    </h3>
                    <span 
                      className={`badge badge-${
                        booking.Booking_Status === 'Confirmed' ? 'success' : 
                        booking.Booking_Status === 'Pending' ? 'warning' : 'danger'
                      }`}
                    >
                      {booking.Booking_Status}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8 }}>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Wing</p>
                      <p style={{ fontWeight: 600 }}>{booking.Wing}</p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8 }}>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Type</p>
                      <p style={{ fontWeight: 600 }}>{booking.Flat_Type}</p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8 }}>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Area</p>
                      <p style={{ fontWeight: 600 }}>{booking.Area_Sqft} sq.ft</p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8 }}>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Payment</p>
                      <p style={{ fontWeight: 600 }}>{booking.Payment_Type}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                    Booked on: {new Date(booking.Booking_Date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pagination" style={{ padding: "32px 0", justifyContent: "center" }}>
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>â€¹</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`page-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>â€º</button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

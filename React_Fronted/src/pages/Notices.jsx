import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "https://auraheight.onrender.com";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchNotices();
  }, []);

  const totalPages = Math.ceil(notices.length / limit);
  const paginated = notices.slice((page - 1) * limit, page * limit);

  const fetchNotices = async () => {
    try {
      const { data } = await axios.get(`${API}/notices`);
      setNotices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="section-tag" style={{ justifyContent: "center" }}>📌 Notice Board</div>
          <h1 className="section-title">
            Society <span>Announcements</span>
          </h1>
          <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            Stay updated with the latest news, events, and maintenance schedules.
          </p>
        </div>
      </section>

      <section style={{ padding: "80px 0", background: "var(--bg-primary)", minHeight: "50vh" }}>
        <div className="container" style={{ maxWidth: 800 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div className="spinner"></div>
            </div>
          ) : notices.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, background: "var(--bg-glass)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <h3 style={{ color: "var(--text-primary)" }}>No notices at the moment.</h3>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {paginated.map((notice) => (
                <div 
                  key={notice.id}
                  style={{
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border)",
                    borderLeft: "4px solid var(--primary)",
                    borderRadius: "var(--radius-md)",
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 20, color: "var(--text-primary)", margin: 0 }}>{notice.title}</h3>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4 }}>
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {notice.content}
                  </p>
                </div>
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

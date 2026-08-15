import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:3000";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.users || 0, icon: "👤", color: "icon-purple", trend: "Registered", link: "/admin/users" },
    { label: "Total Residents", value: stats?.residents || 0, icon: "👥", color: "icon-teal", trend: "Booked", link: "/admin/users" },
    { label: "Total Flats", value: stats?.flats || 0, icon: "🏢", color: "icon-gold", trend: "Managed", link: "/admin/flats" },
    { label: "Available Flats", value: stats?.availableFlats || 0, icon: "✅", color: "icon-green", trend: "Open", link: "/admin/flats" },
    { label: "Booked Flats", value: stats?.bookedFlats || 0, icon: "🔒", color: "icon-blue", trend: "Occupied", link: "/admin/flats" },
    { label: "Total Bookings", value: stats?.bookings || 0, icon: "📋", color: "icon-teal", trend: "All Time", link: "/admin/bookings" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>📊 Dashboard</h1>
          <p>Welcome back! Here's what's happening in your society today.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchStats}>
            🔄 Refresh
          </button>
          <Link to="/admin/users" className="btn btn-primary btn-sm">
            + Add Resident
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stat-cards">
        {statCards.map((card, i) => (
          <Link to={card.link} key={i} style={{ textDecoration: "none" }}>
            <div className="admin-stat-card">
              <div className={`admin-stat-icon ${card.color}`}>{card.icon}</div>
              <div className="admin-stat-info">
                <h3>{card.value.toLocaleString()}</h3>
                <p>{card.label}</p>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  padding: "3px 8px",
                  whiteSpace: "nowrap",
                }}
              >
                {card.trend}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        {/* Role Distribution */}
        <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>👥 Users by Status</h3>
          {stats?.roleStats?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.roleStats.map((r, i) => {
                const colors = ["#0891b2", "#0284c7", "#f59e0b", "#10b981"];
                const total = stats.roleStats.reduce((a, b) => a + Number(b.count), 0);
                const pct = Math.round((r.count / total) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: "var(--text-secondary)" }}>{r.Role}</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {r.count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: colors[i % colors.length], borderRadius: 4, transition: "width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No data yet</p>
          )}
        </div>

        {/* Flat Status */}
        <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🏢 Flat Occupancy</h3>
          {stats?.flats > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
                <div style={{ position: "relative", width: 140, height: 140 }}>
                  <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#10b981" strokeWidth="12"
                      strokeDasharray={`${(stats.availableFlats / stats.flats) * 251} 251`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#0891b2" strokeWidth="12"
                      strokeDasharray={`${(stats.bookedFlats / stats.flats) * 251} 251`}
                      strokeDashoffset={`-${(stats.availableFlats / stats.flats) * 251}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{stats.flats}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Total</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Available</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>{stats.availableFlats}</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0891b2" }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Booked</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#0891b2" }}>{stats.bookedFlats}</span>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No flat data</p>
          )}
        </div>
      </div>

      {/* Recent Tables Row */}
      <div className="dashboard-grid">
        {/* Recent Users */}
        <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>👥 Recent Residents</h3>
            <Link to="/admin/users" style={{ fontSize: 12, color: "var(--primary-light)", textDecoration: "none" }}>View all →</Link>
          </div>
          {stats?.recentUsers?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.recentUsers.map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {u.Full_Name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {u.Full_Name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.Email}</div>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>{u.Role}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No residents yet</p>
          )}
        </div>

        {/* Recent Bookings */}
        <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>📋 Recent Bookings</h3>
            <Link to="/admin/bookings" style={{ fontSize: 12, color: "var(--primary-light)", textDecoration: "none" }}>View all →</Link>
          </div>
          {stats?.recentBookings?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.recentBookings.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(8,145,178,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    🏠
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      Flat {b.Flat_No}, Wing {b.Wing}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {b.Full_Name}
                    </div>
                  </div>
                  <span className={`badge ${b.Booking_Status === "Confirmed" ? "badge-success" : b.Booking_Status === "Cancelled" ? "badge-danger" : "badge-warning"}`} style={{ fontSize: 10 }}>
                    {b.Booking_Status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

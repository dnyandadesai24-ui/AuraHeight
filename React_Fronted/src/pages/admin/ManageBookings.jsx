import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://auraheight.onrender.com";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Cancelled"];

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    let data = [...bookings];
    if (search) data = data.filter(b =>
      b.Full_Name?.toLowerCase().includes(search.toLowerCase()) ||
      b.Email?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.Flat_No).includes(search) ||
      b.Wing?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) data = data.filter(b => (b.Booking_Status || "Pending") === statusFilter);
    setFiltered(data);
    setPage(1);
  }, [bookings, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/bookings`);
      setBookings(res.data);
    } catch (err) {
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/bookings/${id}`, { Booking_Status: status });
      showToast(`Booking ${status.toLowerCase()} successfully`);
      fetchBookings();
    } catch (err) {
      showToast("Failed to update booking status", "error");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking? The flat will become available again.")) return;
    try {
      await axios.delete(`${API}/bookings/${id}`);
      showToast("Booking cancelled and flat released");
      fetchBookings();
    } catch (err) {
      showToast("Failed to cancel booking", "error");
    }
  };

  const getStatusBadge = (status) => {
    const s = status || "Pending";
    if (s === "Confirmed") return "badge-success";
    if (s === "Cancelled") return "badge-danger";
    return "badge-warning";
  };

  const summary = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.Booking_Status === "Confirmed").length,
    pending: bookings.filter(b => !b.Booking_Status || b.Booking_Status === "Pending").length,
    cancelled: bookings.filter(b => b.Booking_Status === "Cancelled").length,
  };

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type === "error" ? "error" : "success"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>📋 Manage Bookings</h1>
          <p>Review, approve, and manage flat booking requests</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchBookings}>🔄 Refresh</button>
      </div>

      {/* Summary */}
      <div className="admin-stat-cards">
        {[
          { label: "Total Bookings", value: summary.total, icon: "📋", color: "icon-purple" },
          { label: "Confirmed", value: summary.confirmed, icon: "✅", color: "icon-green" },
          { label: "Pending", value: summary.pending, icon: "⏳", color: "icon-gold" },
          { label: "Cancelled", value: summary.cancelled, icon: "❌", color: "icon-red" },
        ].map((c, i) => (
          <div key={i} className="admin-stat-card" style={{ cursor: "default" }}>
            <div className={`admin-stat-icon ${c.color}`}>{c.icon}</div>
            <div className="admin-stat-info">
              <h3>{c.value}</h3>
              <p>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍 </span>
          <input placeholder="Search by resident, flat, wing..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: "auto", minWidth: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {loading ? (
          <div className="loading-container" style={{ minHeight: 200 }}>
            <div className="spinner" />
            <p>Loading bookings...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Resident</th>
                  <th>Flat</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No bookings found</td></tr>
                ) : (
                  paginated.map((b, i) => (
                    <tr key={b.Booking_ID}>
                      <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{(page - 1) * limit + i + 1}</td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{b.Full_Name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.Email}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>Flat {b.Flat_No}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Wing {b.Wing}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{b.Flat_Type}</td>
                      <td>
                        <span className="badge badge-info">{b.Payment_Type}</span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {b.Booking_Date ? new Date(b.Booking_Date).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(b.Booking_Status)}`}>
                          {b.Booking_Status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {(!b.Booking_Status || b.Booking_Status === "Pending") && (
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(b.Booking_ID, "Confirmed")}>
                              ✅
                            </button>
                          )}
                          {b.Booking_Status !== "Cancelled" && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.Booking_ID)}>
                              ❌
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{ padding: "16px 24px", justifyContent: "flex-end" }}>
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
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000";

const EMPTY_FORM = {
  Flat_No: "", Wing: "", Flat_Type: "2BHK", Floor_No: "",
  Area_Sqft: "", Status: "Available", Maintenance_Amount: "", User_ID: "",
};

export default function ManageFlats() {
  const [flats, setFlats] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [showModal, setShowModal] = useState(false);
  const [editFlat, setEditFlat] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchFlats(); }, []);

  useEffect(() => {
    let data = [...flats];
    if (search) data = data.filter(f =>
      String(f.Flat_No).includes(search) ||
      f.Wing?.toLowerCase().includes(search.toLowerCase()) ||
      f.Flat_Type?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) data = data.filter(f => f.Status === statusFilter);
    setFiltered(data);
    setPage(1);
  }, [flats, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/flats`);
      setFlats(res.data);
    } catch (err) {
      showToast("Failed to load flats", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditFlat(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (f) => {
    setEditFlat(f);
    setForm({ ...f });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editFlat) {
        await axios.put(`${API}/flats/${editFlat.Flat_ID}`, form);
        showToast("Flat updated successfully");
      } else {
        await axios.post(`${API}/flats`, form);
        showToast("Flat added successfully");
      }
      setShowModal(false);
      fetchFlats();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, no) => {
    if (!window.confirm(`Delete Flat #${no}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/flats/${id}`);
      showToast("Flat deleted successfully");
      fetchFlats();
    } catch (err) {
      showToast("Failed to delete flat", "error");
    }
  };

  const available = flats.filter(f => f.Status === "Available").length;
  const booked = flats.filter(f => f.Status === "Booked").length;

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
          <h1>🏢 Manage Flats</h1>
          <p>Add, edit, and monitor all residential flats</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Flat</button>
      </div>

      {/* Summary Cards */}
      <div className="admin-stat-cards">
        {[
          { label: "Total Flats", value: flats.length, icon: "🏢", color: "icon-purple" },
          { label: "Available", value: available, icon: "✅", color: "icon-green" },
          { label: "Booked", value: booked, icon: "🔒", color: "icon-blue" },
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
          <span className="search-icon" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
          <input placeholder="Search flat no, wing, type..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: "auto", minWidth: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Booked">Booked</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {loading ? (
          <div className="loading-container" style={{ minHeight: 200 }}>
            <div className="spinner" />
            <p>Loading flats...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Flat No</th>
                  <th>Wing</th>
                  <th>Type</th>
                  <th>Floor</th>
                  <th>Area (Sqft)</th>
                  <th>Maintenance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No flats found</td></tr>
                ) : (
                  paginated.map((f, i) => (
                    <tr key={f.Flat_ID}>
                      <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{(page - 1) * limit + i + 1}</td>
                      <td style={{ fontWeight: 700, fontSize: 15 }}>{f.Flat_No}</td>
                      <td>
                        <span className="badge badge-primary">Wing {f.Wing}</span>
                      </td>
                      <td style={{ fontSize: 13 }}>{f.Flat_Type}</td>
                      <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>Floor {f.Floor_No}</td>
                      <td style={{ fontSize: 13 }}>{f.Area_Sqft} sq.ft</td>
                      <td style={{ fontWeight: 600, color: "var(--accent)" }}>
                        ₹{Number(f.Maintenance_Amount || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${f.Status === "Available" ? "badge-success" : "badge-danger"}`}>
                          {f.Status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(f)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f.Flat_ID, f.Flat_No)}>🗑️</button>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editFlat ? "✏️ Edit Flat" : "➕ Add Flat"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Flat No *</label>
                  <input className="form-input" required placeholder="101" value={form.Flat_No} onChange={e => setForm({ ...form, Flat_No: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Wing *</label>
                  <select className="form-input" value={form.Wing} onChange={e => setForm({ ...form, Wing: e.target.value })} required>
                    <option value="">Select Wing</option>
                    {["A", "B", "C", "D"].map(w => <option key={w} value={w}>Wing {w}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Flat Type *</label>
                  <select className="form-input" value={form.Flat_Type} onChange={e => setForm({ ...form, Flat_Type: e.target.value })}>
                    {["Studio", "1BHK", "2BHK", "3BHK", "4BHK"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Floor No *</label>
                  <input className="form-input" type="number" required placeholder="1" value={form.Floor_No} onChange={e => setForm({ ...form, Floor_No: e.target.value })} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Area (Sqft) *</label>
                  <input className="form-input" type="number" required placeholder="850" value={form.Area_Sqft} onChange={e => setForm({ ...form, Area_Sqft: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Maintenance (₹) *</label>
                  <input className="form-input" type="number" required placeholder="2500" value={form.Maintenance_Amount} onChange={e => setForm({ ...form, Maintenance_Amount: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })}>
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>

              {editFlat && (
                <div className="form-group">
                  <label className="form-label">Assigned User ID (optional)</label>
                  <input className="form-input" placeholder="User ID" value={form.User_ID || ""} onChange={e => setForm({ ...form, User_ID: e.target.value })} />
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? "Saving..." : editFlat ? "Update Flat" : "Add Flat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://auraheight.onrender.com";

const EMPTY_FORM = {
  full_name: "", username: "", email: "", mobile: "",
  password: "", role: "Resident", resident_type: "Owner",
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("Resident"); // "User" or "Resident"
  const limit = 10;

  useEffect(() => { fetchUsers(); }, [page, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/epagination?page=${page}&limit=${limit}&status=${activeTab}`);
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditUser(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ ...u, password: "" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        await axios.put(`${API}/users/${editUser.id}`, form);
        showToast("User updated successfully");
      } else {
        await axios.post(`${API}/users`, form);
        showToast("User added successfully");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/users/${id}`);
      showToast("User deleted successfully");
      fetchUsers();
    } catch (err) {
      showToast("Failed to delete user", "error");
    }
  };

  const filtered = users.filter((u) =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type === "error" ? "error" : "success"}`}>
          {toast.type === "error" ? "âŒ" : "âœ…"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>ðŸ‘¥ Manage {activeTab}s</h1>
          <p>View, add, edit, and remove society {activeTab.toLowerCase()}s</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add {activeTab}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button 
          className={`btn ${activeTab === "Resident" ? "btn-primary" : "btn-outline"}`}
          onClick={() => { setActiveTab("Resident"); setPage(1); }}
        >
          Residents (Booked)
        </button>
        <button 
          className={`btn ${activeTab === "User" ? "btn-primary" : "btn-outline"}`}
          onClick={() => { setActiveTab("User"); setPage(1); }}
        >
          Users (Registered)
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }} className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>ðŸ”</span>
          <input
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: "auto" }}>
          {filtered.length} resident{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {loading ? (
          <div className="loading-container" style={{ minHeight: 200 }}>
            <div className="spinner" />
            <p>Loading residents...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{activeTab}</th>
                    <th>Username</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Status</th>
                    {activeTab === "Resident" && <th>Type</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                        No residents found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, i) => (
                      <tr key={u.id}>
                        <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{(page - 1) * limit + i + 1}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                              {u.full_name?.[0] || "?"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{u.full_name}</div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>@{u.username}</td>
                        <td style={{ fontSize: 13 }}>{u.mobile}</td>
                        <td>
                        <span className={`status-badge status-${u.role === "Admin" ? "success" : "pending"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${u.user_status === "Resident" ? "success" : "warning"}`}>
                          {u.user_status || "User"}
                        </span>
                      </td>
                      {activeTab === "Resident" && (
                        <td>
                          {u.resident_type ? (
                            <span style={{ fontSize: 13, background: "rgba(0,0,0,0.05)", padding: "4px 8px", borderRadius: 12 }}>
                              {u.resident_type}
                            </span>
                          ) : "-"}
                        </td>
                      )}
                      <td>    <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>
                              âœï¸ Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.full_name)}>
                              ðŸ—‘ï¸
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{ padding: "16px 24px", justifyContent: "flex-end" }}>
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>â€¹</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={`page-btn ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>â€º</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editUser ? "âœï¸ Edit Resident" : "âž• Add Resident"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>âœ•</button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required placeholder="John Doe" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input className="form-input" required placeholder="johndoe" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile *</label>
                  <input className="form-input" required placeholder="9876543210" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" required placeholder="john@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">{editUser ? "New Password (leave blank to keep current)" : "Password *"}</label>
                <input className="form-input" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editUser} minLength={editUser ? 0 : 6} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="Resident">Resident</option>
                    <option value="Manager">Manager</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Resident Type</label>
                  <select className="form-input" value={form.resident_type} onChange={e => setForm({ ...form, resident_type: e.target.value })}>
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? "Saving..." : editUser ? "Update" : "Add Resident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

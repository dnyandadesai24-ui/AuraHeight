import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000";

export default function ManageNotices() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const token = localStorage.getItem("admin_token");

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
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/admin/notices`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ title: "", content: "" });
      fetchNotices();
    } catch (err) {
      alert("Error adding notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API}/admin/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotices();
    } catch (err) {
      alert("Error deleting notice");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h2>Manage Notices</h2>
          <p>Create and manage society announcements.</p>
        </div>
      </div>

      <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 30 }}>
        <h3>Add New Notice</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea 
              className="form-input" 
              rows={4} 
              required 
              value={form.content}
              onChange={(e) => setForm({...form, content: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={loading}>
            {loading ? "Publishing..." : "Publish Notice"}
          </button>
        </form>
      </div>

      <div className="table-container">
        {fetching ? (
          <div style={{ textAlign: "center", padding: 40 }}><div className="spinner"></div></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Content</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(notice => (
                <tr key={notice.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(notice.created_at).toLocaleDateString()}</td>
                  <td><strong>{notice.title}</strong></td>
                  <td style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {notice.content}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(notice.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: "center" }}>No notices found.</td></tr>
              )}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {!fetching && totalPages > 1 && (
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
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000";

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const totalPages = Math.ceil(complaints.length / limit);
  const paginated = complaints.slice((page - 1) * limit, page * limit);

  const fetchComplaints = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API}/admin/complaints/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComplaints();
    } catch (err) {
      alert("Error updating status");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h2>Manage Complaints</h2>
          <p>Review and resolve resident complaints.</p>
        </div>
      </div>

      <div className="table-container">
        {fetching ? (
          <div style={{ textAlign: "center", padding: 40 }}><div className="spinner"></div></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Resident</th>
                <th>Subject</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <tr key={c.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <strong>{c.user_name}</strong><br/>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.user_email}</span>
                  </td>
                  <td><strong>{c.subject}</strong></td>
                  <td style={{ maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.description}
                  </td>
                  <td>
                    <span 
                      className={`badge badge-${c.status === 'Resolved' ? 'success' : 'warning'}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="form-input" 
                      style={{ padding: "4px 8px", fontSize: 13, height: "auto" }}
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: "center" }}>No complaints found.</td></tr>
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

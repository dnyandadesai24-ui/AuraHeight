import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "https://auraheight.onrender.com";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ subject: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const user = JSON.parse(localStorage.getItem("society_user"));

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const { data } = await axios.get(`${API}/complaints/${user.uid}`);
      setComplaints(data);
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
      await axios.post(`${API}/complaints`, {
        user_id: user.uid,
        subject: form.subject,
        description: form.description
      });
      setForm({ subject: "", description: "" });
      fetchComplaints();
      alert("Complaint submitted successfully!");
    } catch (err) {
      alert("Error submitting complaint.");
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
          <div className="section-tag" style={{ justifyContent: "center" }}>ðŸ“ Helpdesk</div>
          <h1 className="section-title">
            Submit a <span>Complaint</span>
          </h1>
          <p className="section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            Facing an issue? Let us know and our team will resolve it promptly.
          </p>
        </div>
      </section>

      <section style={{ padding: "60px 0", background: "var(--bg-primary)", minHeight: "50vh" }}>
        <div className="container" style={{ maxWidth: 800 }}>
          
          {/* Submit Form */}
          <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 32, marginBottom: 40 }}>
            <h3 style={{ marginBottom: 20 }}>New Complaint</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={form.subject}
                  onChange={(e) => setForm({...form, subject: e.target.value})}
                  placeholder="E.g., Plumbing issue in kitchen"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  required 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Describe the issue in detail..."
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>

          {/* Past Complaints */}
          <h3 style={{ marginBottom: 20, color: "var(--text-primary)" }}>My Complaints</h3>
          {fetching ? (
            <div style={{ textAlign: "center", padding: 20 }}><div className="spinner"></div></div>
          ) : complaints.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", background: "var(--bg-glass)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              You have no complaints.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {complaints.map(c => (
                <div key={c.id} style={{ padding: 20, background: "var(--bg-glass)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 18 }}>{c.subject}</h4>
                    <span style={{ 
                      fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 4,
                      background: c.status === 'Resolved' ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                      color: c.status === 'Resolved' ? "#10b981" : "#f59e0b"
                    }}>
                      {c.status}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 12 }}>{c.description}</p>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Submitted on: {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
      <Footer />
    </>
  );
}

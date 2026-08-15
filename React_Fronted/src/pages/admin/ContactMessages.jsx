import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000";

export default function ContactMessages() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await axios.get(`${API}/admin/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(res.data);
    } catch (err) {
      showToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await axios.delete(`${API}/admin/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Message deleted");
      if (selected?.id === id) setSelected(null);
      fetchContacts();
    } catch (err) {
      showToast("Failed to delete message", "error");
    }
  };

  const filtered = contacts.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1>💬 Contact Messages</h1>
          <p>View and manage messages from the contact form</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {contacts.length} Messages
          </span>
          <button className="btn btn-secondary btn-sm" onClick={fetchContacts}>🔄 Refresh</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div className="search-input-wrapper" style={{ maxWidth: 400 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
          <input placeholder="Search by name, email, or subject..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.4fr" : "1fr", gap: 20 }}>
        {/* Messages List */}
        <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          {loading ? (
            <div className="loading-container" style={{ minHeight: 200 }}>
              <div className="spinner" />
              <p>Loading messages...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p>No messages found</p>
            </div>
          ) : (
            <div>
              {filtered.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "var(--transition)",
                    background: selected?.id === c.id ? "rgba(99,102,241,0.08)" : "transparent",
                    borderLeft: selected?.id === c.id ? "3px solid var(--primary)" : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: "var(--gradient-primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 16, flexShrink: 0,
                    }}>
                      {c.name?.[0] || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{c.name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(c.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--primary-light)", marginTop: 2 }}>{c.email}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, fontWeight: 500 }}>
                        {c.subject || "(No subject)"}
                      </div>
                      <div style={{
                        fontSize: 12, color: "var(--text-muted)", marginTop: 4,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {c.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        {selected && (
          <div style={{
            background: "var(--bg-glass)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: 28, animation: "slideUp 0.2s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Message Details</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>
                  🗑️ Delete
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "From", value: selected.name },
                { label: "Email", value: selected.email },
                { label: "Subject", value: selected.subject || "(No subject)" },
                { label: "Date", value: new Date(selected.created_at).toLocaleString("en-IN") },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <span style={{ width: 70, fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, flexShrink: 0, paddingTop: 2 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{item.value}</span>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                  Message
                </div>
                <div style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: 18,
                  fontSize: 14,
                  color: "var(--text-primary)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}>
                  {selected.message}
                </div>
              </div>

              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message"}`}
                className="btn btn-primary"
                style={{ marginTop: 8, justifyContent: "center" }}
              >
                📧 Reply via Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

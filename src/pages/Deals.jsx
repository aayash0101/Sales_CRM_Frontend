import { useState, useEffect } from "react";
import API from "../api/axios";

const stageColors = {
  proposal: "#6366f1",
  negotiation: "#f59e0b",
  won: "#10b981",
  lost: "#ef4444",
};

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    customer: "",
    value: "",
    stage: "proposal",
    expectedCloseDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [dealsRes, customersRes] = await Promise.all([
        API.get("/deals"),
        API.get("/customers"),
      ]);
      setDeals(dealsRes.data.data);
      setCustomers(customersRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/deals/${editingId}`, formData);
      } else {
        await API.post("/deals", formData);
      }
      setFormData({ title: "", customer: "", value: "", stage: "proposal", expectedCloseDate: "", notes: "" });
      setShowForm(false);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save deal");
    }
  };

  const handleEdit = (deal) => {
    setFormData({
      title: deal.title,
      customer: deal.customer?._id || "",
      value: deal.value,
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate?.split("T")[0] || "",
      notes: deal.notes || "",
    });
    setEditingId(deal._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await API.delete(`/deals/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete deal");
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", customer: "", value: "", stage: "proposal", expectedCloseDate: "", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const totalValue = deals
    .filter(d => d.stage === "won")
    .reduce((sum, d) => sum + d.value, 0);

  if (loading) return <p style={styles.center}>Loading deals...</p>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1>Deals</h1>
          <p style={styles.sub}>
            {deals.length} deals · Won: ${totalValue.toLocaleString()}
          </p>
        </div>
        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Deal"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3>{editingId ? "Edit Deal" : "New Deal"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <input
                name="title"
                placeholder="Deal Title *"
                value={formData.title}
                onChange={handleChange}
                style={styles.input}
                required
              />
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Customer *</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `· ${c.company}` : ""}
                  </option>
                ))}
              </select>
              <input
                name="value"
                type="number"
                placeholder="Deal Value ($)"
                value={formData.value}
                onChange={handleChange}
                style={styles.input}
              />
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
              <input
                name="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={handleChange}
                style={styles.input}
              />
              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
                style={styles.input}
                rows={2}
              />
            </div>
            <div style={styles.formButtons}>
              <button type="submit" style={styles.addButton}>
                {editingId ? "Update Deal" : "Create Deal"}
              </button>
              <button type="button" onClick={handleCancel} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deals Board */}
      {deals.length === 0 ? (
        <p style={styles.center}>No deals yet. Create your first deal!</p>
      ) : (
        <div style={styles.board}>
          {["proposal", "negotiation", "won", "lost"].map((stage) => (
            <div key={stage} style={styles.column}>
              <div style={{ ...styles.columnHeader, borderTop: `3px solid ${stageColors[stage]}` }}>
                <span style={styles.columnTitle}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
                <span style={styles.columnCount}>
                  {deals.filter(d => d.stage === stage).length}
                </span>
              </div>
              {deals
                .filter((d) => d.stage === stage)
                .map((deal) => (
                  <div key={deal._id} style={styles.dealCard}>
                    <h4 style={styles.dealTitle}>{deal.title}</h4>
                    <p style={styles.dealCustomer}>
                      🏢 {deal.customer?.name || "—"}
                    </p>
                    <p style={styles.dealValue}>
                      ${deal.value?.toLocaleString() || 0}
                    </p>
                    {deal.expectedCloseDate && (
                      <p style={styles.dealDate}>
                        📅 {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </p>
                    )}
                    {deal.notes && (
                      <p style={styles.dealNotes}>{deal.notes}</p>
                    )}
                    <p style={styles.dealMeta}>By {deal.createdBy?.name || "—"}</p>
                    <div style={styles.dealActions}>
                      <button onClick={() => handleEdit(deal)} style={styles.editButton}>Edit</button>
                      <button onClick={() => handleDelete(deal._id)} style={styles.deleteButton}>Delete</button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "2rem", maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  sub: { color: "#666", marginTop: "0.3rem", fontSize: "0.95rem" },
  error: { color: "red", marginBottom: "1rem" },
  center: { textAlign: "center", marginTop: "2rem", color: "#666" },
  addButton: { padding: "0.6rem 1.2rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  cancelButton: { padding: "0.6rem 1.2rem", backgroundColor: "#e5e7eb", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" },
  formCard: { background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "1.5rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" },
  input: { padding: "0.6rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.95rem", width: "100%" },
  formButtons: { display: "flex", gap: "1rem", marginTop: "1rem" },
  board: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" },
  column: { background: "#f8f9fa", borderRadius: "8px", padding: "1rem", minHeight: "400px" },
  columnHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "0.5rem" },
  columnTitle: { fontWeight: "bold", textTransform: "capitalize", fontSize: "0.95rem" },
  columnCount: { background: "#e5e7eb", borderRadius: "20px", padding: "0.1rem 0.6rem", fontSize: "0.8rem" },
  dealCard: { background: "white", borderRadius: "6px", padding: "1rem", marginBottom: "0.8rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  dealTitle: { fontSize: "0.95rem", fontWeight: "bold", marginBottom: "0.4rem" },
  dealCustomer: { fontSize: "0.85rem", color: "#555", marginBottom: "0.3rem" },
  dealValue: { fontSize: "1rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.3rem" },
  dealDate: { fontSize: "0.8rem", color: "#888", marginBottom: "0.3rem" },
  dealNotes: { fontSize: "0.8rem", color: "#777", fontStyle: "italic", marginBottom: "0.3rem" },
  dealMeta: { fontSize: "0.75rem", color: "#aaa", marginBottom: "0.5rem" },
  dealActions: { display: "flex", gap: "0.4rem" },
  editButton: { padding: "0.3rem 0.7rem", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" },
  deleteButton: { padding: "0.3rem 0.7rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" },
};

export default Deals;
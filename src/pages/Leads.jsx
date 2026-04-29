import { useState, useEffect } from "react";
import API from "../api/axios";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", company: "", status: "new",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const fetchLeads = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await API.get("/leads", { params });
      setLeads(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leads");
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
        await API.put(`/leads/${editingId}`, formData);
      } else {
        await API.post("/leads", formData);
      }
      setFormData({ name: "", email: "", phone: "", company: "", status: "new" });
      setShowForm(false);
      setEditingId(null);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save lead");
    }
  };

  const handleEdit = (lead) => {
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: lead.status,
    });
    setEditingId(lead._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await API.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lead");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", email: "", phone: "", company: "", status: "new" });
    setEditingId(null);
    setShowForm(false);
  };

  const statusColors = {
    new: "#6366f1",
    contacted: "#f59e0b",
    qualified: "#10b981",
    converted: "#3b82f6",
  };

  if (loading) return <p style={styles.center}>Loading leads...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Leads</h1>
        <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Lead"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* Search and Filter Bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by name, email, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
        </select>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(""); setStatusFilter(""); }}
            style={styles.clearButton}
          >
            Clear
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={styles.form}>
          <h3>{editingId ? "Edit Lead" : "New Lead"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid}>
              <input name="name" placeholder="Name *" value={formData.name} onChange={handleChange} style={styles.input} required />
              <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} style={styles.input} />
              <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} style={styles.input} />
              <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} style={styles.input} />
              <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
            <div style={styles.formButtons}>
              <button type="submit" style={styles.addButton}>
                {editingId ? "Update Lead" : "Create Lead"}
              </button>
              <button type="button" onClick={handleCancel} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results count */}
      <p style={styles.resultsCount}>
        {leads.length} lead{leads.length !== 1 ? "s" : ""} found
        {statusFilter && ` · ${statusFilter}`}
        {search && ` · "${search}"`}
      </p>

      {/* Leads Table */}
      {leads.length === 0 ? (
        <p style={styles.center}>
          {search || statusFilter ? "No leads match your search." : "No leads yet. Add your first lead!"}
        </p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created By</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} style={styles.tr}>
                <td style={styles.td}>{lead.name}</td>
                <td style={styles.td}>{lead.email || "—"}</td>
                <td style={styles.td}>{lead.company || "—"}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: statusColors[lead.status] }}>
                    {lead.status}
                  </span>
                </td>
                <td style={styles.td}>{lead.createdBy?.name || "—"}</td>
                <td style={styles.td}>
                  <button onClick={() => handleEdit(lead)} style={styles.editButton}>Edit</button>
                  <button onClick={() => handleDelete(lead._id)} style={styles.deleteButton}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "2rem", maxWidth: "1100px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  error: { color: "red", marginBottom: "1rem" },
  center: { textAlign: "center", marginTop: "2rem", color: "#666" },
  filterBar: { display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" },
  searchInput: { padding: "0.6rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.95rem", flex: 1 },
  filterSelect: { padding: "0.6rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.95rem", minWidth: "160px" },
  clearButton: { padding: "0.6rem 1rem", backgroundColor: "#e5e7eb", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" },
  resultsCount: { fontSize: "0.85rem", color: "#888", marginBottom: "1rem" },
  form: { background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "1.5rem" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" },
  input: { padding: "0.6rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "1rem", width: "100%" },
  formButtons: { display: "flex", gap: "1rem", marginTop: "1rem" },
  addButton: { padding: "0.6rem 1.2rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  cancelButton: { padding: "0.6rem 1.2rem", backgroundColor: "#e5e7eb", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  thead: { backgroundColor: "#4f46e5", color: "white" },
  th: { padding: "1rem", textAlign: "left", fontWeight: "600" },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "0.9rem 1rem", fontSize: "0.95rem" },
  badge: { padding: "0.3rem 0.7rem", borderRadius: "20px", color: "white", fontSize: "0.8rem", fontWeight: "bold" },
  editButton: { padding: "0.3rem 0.8rem", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "0.5rem" },
  deleteButton: { padding: "0.3rem 0.8rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
};

export default Leads;
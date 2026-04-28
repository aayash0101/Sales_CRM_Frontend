import { useState, useEffect } from "react";
import API from "../api/axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", company: "", value: "", notes: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customers");
      setCustomers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      value: customer.value || "",
      notes: customer.notes || "",
    });
    setEditingId(customer._id);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/customers/${editingId}`, formData);
      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update customer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await API.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete customer");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "", company: "", value: "", notes: "" });
  };

  if (loading) return <p style={styles.center}>Loading customers...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Customers</h1>
        <span style={styles.count}>{customers.length} total</span>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {customers.length === 0 ? (
        <div style={styles.empty}>
          <p>No customers yet.</p>
          <p style={styles.emptySub}>Convert a lead to see customers here.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {customers.map((customer) => (
            <div key={customer._id} style={styles.card}>
              {editingId === customer._id ? (
                // Edit form inline
                <form onSubmit={handleUpdate}>
                  <h3 style={styles.cardTitle}>Editing Customer</h3>
                  <div style={styles.fieldGroup}>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Name"
                      required
                    />
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Email"
                    />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Phone"
                    />
                    <input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Company"
                    />
                    <input
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Deal Value ($)"
                    />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      style={styles.textarea}
                      placeholder="Notes"
                      rows={3}
                    />
                  </div>
                  <div style={styles.cardActions}>
                    <button type="submit" style={styles.saveButton}>Save</button>
                    <button type="button" onClick={handleCancel} style={styles.cancelButton}>Cancel</button>
                  </div>
                </form>
              ) : (
                // Display mode
                <>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{customer.name}</h3>
                    <span style={styles.valueBadge}>
                      ${customer.value?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div style={styles.cardBody}>
                    <p style={styles.info}>📧 {customer.email || "—"}</p>
                    <p style={styles.info}>📞 {customer.phone || "—"}</p>
                    <p style={styles.info}>🏢 {customer.company || "—"}</p>
                    {customer.notes && (
                      <p style={styles.notes}>📝 {customer.notes}</p>
                    )}
                    <p style={styles.meta}>
                      Managed by {customer.createdBy?.name || "—"}
                    </p>
                    {customer.lead && (
                      <p style={styles.meta}>
                        Converted from lead: {customer.lead?.name}
                      </p>
                    )}
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleEdit(customer)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "2rem", maxWidth: "1100px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" },
  count: { backgroundColor: "#4f46e5", color: "white", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.85rem" },
  error: { color: "red", marginBottom: "1rem" },
  center: { textAlign: "center", marginTop: "2rem", color: "#666" },
  empty: { textAlign: "center", marginTop: "4rem", color: "#666" },
  emptySub: { marginTop: "0.5rem", fontSize: "0.9rem", color: "#999" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" },
  card: { background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  cardTitle: { fontSize: "1.1rem", fontWeight: "bold", color: "#333" },
  valueBadge: { backgroundColor: "#10b981", color: "white", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" },
  cardBody: { marginBottom: "1rem" },
  info: { fontSize: "0.9rem", color: "#555", marginBottom: "0.4rem" },
  notes: { fontSize: "0.9rem", color: "#555", marginTop: "0.5rem", fontStyle: "italic" },
  meta: { fontSize: "0.8rem", color: "#999", marginTop: "0.4rem" },
  cardActions: { display: "flex", gap: "0.5rem", marginTop: "1rem" },
  editButton: { padding: "0.4rem 1rem", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  deleteButton: { padding: "0.4rem 1rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  saveButton: { padding: "0.4rem 1rem", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  cancelButton: { padding: "0.4rem 1rem", backgroundColor: "#e5e7eb", color: "#333", border: "none", borderRadius: "4px", cursor: "pointer" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.7rem", marginBottom: "1rem" },
  input: { padding: "0.6rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.95rem" },
  textarea: { padding: "0.6rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.95rem", resize: "vertical" },
};

export default Customers;
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

  const totalValue = customers.reduce((sum, c) => sum + (c.value || 0), 0);

  if (loading) return (
    <p className="text-center text-gray-400 py-12">Loading customers...</p>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {customers.length} customer{customers.length !== 1 ? "s" : ""} · Total value ${totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {customers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No customers yet</p>
          <p className="text-sm">Convert a lead to see customers here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              {editingId === customer._id ? (
                // Edit Mode
                <form onSubmit={handleUpdate}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Editing Customer
                  </h3>
                  <div className="space-y-3 mb-4">
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="Deal Value ($)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {customer.company || "—"}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                      ${customer.value?.toLocaleString() || 0}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>📧</span> {customer.email || "—"}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>📞</span> {customer.phone || "—"}
                    </p>
                    {customer.notes && (
                      <p className="text-sm text-gray-400 italic flex items-start gap-2">
                        <span>📝</span> {customer.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-50 space-y-1">
                    <p className="text-xs text-gray-400">
                      Managed by {customer.createdBy?.name || "—"}
                    </p>
                    {customer.lead && (
                      <p className="text-xs text-gray-400">
                        Converted from lead: {customer.lead?.name}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-xs font-medium px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
                      className="text-xs font-medium px-3 py-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
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

export default Customers;
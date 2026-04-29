import { useState, useEffect } from "react";
import API from "../api/axios";

const stageColors = {
  proposal: "bg-indigo-100 text-indigo-700",
  negotiation: "bg-yellow-100 text-yellow-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const stageBorderColors = {
  proposal: "border-t-indigo-500",
  negotiation: "border-t-yellow-500",
  won: "border-t-green-500",
  lost: "border-t-red-500",
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const wonRevenue = deals
    .filter((d) => d.stage === "won")
    .reduce((sum, d) => sum + d.value, 0);

  if (loading) return (
    <p className="text-center text-gray-400 py-12">Loading deals...</p>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
          <p className="text-sm text-gray-500 mt-1">
            {deals.length} deal{deals.length !== 1 ? "s" : ""} · Won revenue ${wonRevenue.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? "Cancel" : "+ New Deal"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {editingId ? "Edit Deal" : "New Deal"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enterprise Plan"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.company ? `· ${c.company}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                <input
                  name="value"
                  type="number"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                <input
                  name="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional context"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                {editingId ? "Update Deal" : "Create Deal"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      {deals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No deals yet</p>
          <p className="text-sm">Create your first deal to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {["proposal", "negotiation", "won", "lost"].map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={stage} className={`bg-gray-50 rounded-xl p-4 border-t-4 ${stageBorderColors[stage]}`}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-700 capitalize">
                    {stage}
                  </span>
                  <span className="bg-white text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Stage Total */}
                <p className="text-xs text-gray-400 mb-3">
                  ${stageTotal.toLocaleString()} total
                </p>

                {/* Deal Cards */}
                <div className="space-y-3">
                  {stageDeals.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center py-4">
                      No deals
                    </p>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal._id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                      >
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">
                          {deal.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          🏢 {deal.customer?.name || "—"}
                        </p>
                        <p className="text-base font-bold text-green-600 mb-2">
                          ${deal.value?.toLocaleString() || 0}
                        </p>
                        {deal.expectedCloseDate && (
                          <p className="text-xs text-gray-400 mb-1">
                            📅 {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </p>
                        )}
                        {deal.notes && (
                          <p className="text-xs text-gray-400 italic mb-2">
                            {deal.notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-300 mb-3">
                          By {deal.createdBy?.name || "—"}
                        </p>
                        <div className="flex gap-1.5 pt-2 border-t border-gray-50">
                          <button
                            onClick={() => handleEdit(deal)}
                            className="text-xs font-medium px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(deal._id)}
                            className="text-xs font-medium px-2.5 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Deals;
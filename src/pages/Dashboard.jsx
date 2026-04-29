import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import API from "../api/axios";

const stageColors = {
  proposal: "bg-indigo-100 text-indigo-700",
  negotiation: "bg-yellow-100 text-yellow-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const statusColors = {
  new: "bg-indigo-100 text-indigo-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualified: "bg-green-100 text-green-700",
  converted: "bg-blue-100 text-blue-700",
};

const stageDotColors = {
  proposal: "bg-indigo-500",
  negotiation: "bg-yellow-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

const StatCard = ({ label, value, link, linkLabel, highlight }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 border-t-4 ${highlight || "border-indigo-500"}`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <h2 className="text-4xl font-bold text-gray-800 mb-3">{value}</h2>
    {link ? (
      <Link to={link} className="text-indigo-600 text-sm hover:underline">
        {linkLabel} →
      </Link>
    ) : (
      <p className="text-sm text-gray-400">{linkLabel}</p>
    )}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/stats");
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  );

  if (error) (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-500">{error}</p>
    </div>
  );

  const stageMap = {};
  stats?.dealsByStage.forEach((s) => {
    stageMap[s._id] = { count: s.count, value: s.value };
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Welcome Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's your sales overview
          </p>
        </div>
        <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full capitalize">
          {user?.role}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Leads"
          value={stats?.totalLeads ?? "—"}
          link="/leads"
          linkLabel="View all leads"
        />
        <StatCard
          label="Total Customers"
          value={stats?.totalCustomers ?? "—"}
          link="/customers"
          linkLabel="View all customers"
        />
        <StatCard
          label="Total Deals"
          value={stats?.totalDeals ?? "—"}
          link="/deals"
          linkLabel="View all deals"
        />
        <StatCard
          label="Won Revenue"
          value={`$${(stats?.wonRevenue ?? 0).toLocaleString()}`}
          linkLabel="Closed deals total"
          highlight="border-green-500"
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-6">

        {/* Deals by Stage */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Deals by Stage
          </h3>
          <div className="space-y-3">
            {["proposal", "negotiation", "won", "lost"].map((stage) => {
              const data = stageMap[stage] || { count: 0, value: 0 };
              return (
                <div key={stage} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${stageDotColors[stage]}`} />
                    <span className="text-sm text-gray-700 capitalize">{stage}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">{data.count} deals</span>
                    <span className="text-sm font-semibold text-gray-700">
                      ${data.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Recent Leads
          </h3>
          {!stats?.recentLeads?.length ? (
            <p className="text-sm text-gray-400">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <div key={lead._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{lead.name}</p>
                    <p className="text-xs text-gray-400">{lead.company || "—"}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/leads"
            className="block mt-4 text-sm text-indigo-600 hover:underline"
          >
            View all leads →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
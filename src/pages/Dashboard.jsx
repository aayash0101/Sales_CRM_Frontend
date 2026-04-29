import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import API from "../api/axios";

const stageColors = {
  proposal: "#6366f1",
  negotiation: "#f59e0b",
  won: "#10b981",
  lost: "#ef4444",
};

const statusColors = {
  new: "#6366f1",
  contacted: "#f59e0b",
  qualified: "#10b981",
  converted: "#3b82f6",
};

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

  if (loading) return <p style={styles.center}>Loading dashboard...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  // Normalize dealsByStage into a lookup object
  const stageMap = {};
  stats.dealsByStage.forEach((s) => {
    stageMap[s._id] = { count: s.count, value: s.value };
  });

  return (
    <div style={styles.container}>
      {/* Welcome */}
      <div style={styles.welcomeBar}>
        <div>
          <h1 style={styles.heading}>Welcome back, {user?.name} 👋</h1>
          <p style={styles.sub}>Here's your sales overview</p>
        </div>
        <span style={styles.roleBadge}>{user?.role}</span>
      </div>

      {/* Stat Cards */}
      <div style={styles.cardGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Leads</p>
          <h2 style={styles.statNumber}>{stats.totalLeads}</h2>
          <Link to="/leads" style={styles.statLink}>View all →</Link>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Customers</p>
          <h2 style={styles.statNumber}>{stats.totalCustomers}</h2>
          <Link to="/customers" style={styles.statLink}>View all →</Link>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Deals</p>
          <h2 style={styles.statNumber}>{stats.totalDeals}</h2>
          <Link to="/deals" style={styles.statLink}>View all →</Link>
        </div>
        <div style={{ ...styles.statCard, borderTop: "3px solid #10b981" }}>
          <p style={styles.statLabel}>Won Revenue</p>
          <h2 style={{ ...styles.statNumber, color: "#10b981" }}>
            ${stats.wonRevenue.toLocaleString()}
          </h2>
          <p style={styles.statLink}>Closed deals total</p>
        </div>
      </div>

      <div style={styles.bottomGrid}>
        {/* Deals by Stage */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Deals by Stage</h3>
          {["proposal", "negotiation", "won", "lost"].map((stage) => {
            const data = stageMap[stage] || { count: 0, value: 0 };
            return (
              <div key={stage} style={styles.stageRow}>
                <div style={styles.stageLeft}>
                  <span
                    style={{
                      ...styles.stageDot,
                      backgroundColor: stageColors[stage],
                    }}
                  />
                  <span style={styles.stageName}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </span>
                </div>
                <div style={styles.stageRight}>
                  <span style={styles.stageCount}>{data.count} deals</span>
                  <span style={styles.stageValue}>
                    ${data.value.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Leads */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Leads</h3>
          {stats.recentLeads.length === 0 ? (
            <p style={styles.empty}>No leads yet.</p>
          ) : (
            stats.recentLeads.map((lead) => (
              <div key={lead._id} style={styles.leadRow}>
                <div style={styles.leadLeft}>
                  <p style={styles.leadName}>{lead.name}</p>
                  <p style={styles.leadCompany}>{lead.company || "—"}</p>
                </div>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: statusColors[lead.status],
                  }}
                >
                  {lead.status}
                </span>
              </div>
            ))
          )}
          <Link to="/leads" style={styles.viewAll}>View all leads →</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "2rem", maxWidth: "1100px", margin: "0 auto" },
  center: { textAlign: "center", marginTop: "2rem", color: "#666" },
  error: { color: "red", textAlign: "center", marginTop: "2rem" },
  welcomeBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" },
  heading: { fontSize: "1.8rem", marginBottom: "0.3rem" },
  sub: { color: "#666" },
  roleBadge: { backgroundColor: "#4f46e5", color: "white", padding: "0.3rem 1rem", borderRadius: "20px", fontSize: "0.85rem", textTransform: "capitalize" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" },
  statCard: { background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderTop: "3px solid #4f46e5" },
  statLabel: { color: "#666", fontSize: "0.9rem", marginBottom: "0.5rem" },
  statNumber: { fontSize: "2.5rem", fontWeight: "bold", color: "#333", marginBottom: "0.5rem" },
  statLink: { color: "#4f46e5", fontSize: "0.85rem", textDecoration: "none" },
  bottomGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" },
  section: { background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  sectionTitle: { fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1.2rem", color: "#333" },
  stageRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 0", borderBottom: "1px solid #f0f0f0" },
  stageLeft: { display: "flex", alignItems: "center", gap: "0.7rem" },
  stageDot: { width: "10px", height: "10px", borderRadius: "50%", display: "inline-block" },
  stageName: { fontSize: "0.95rem", textTransform: "capitalize" },
  stageRight: { display: "flex", gap: "1rem", alignItems: "center" },
  stageCount: { fontSize: "0.85rem", color: "#888" },
  stageValue: { fontSize: "0.95rem", fontWeight: "bold", color: "#333" },
  leadRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 0", borderBottom: "1px solid #f0f0f0" },
  leadLeft: {},
  leadName: { fontSize: "0.95rem", fontWeight: "500" },
  leadCompany: { fontSize: "0.8rem", color: "#888" },
  badge: { padding: "0.2rem 0.6rem", borderRadius: "20px", color: "white", fontSize: "0.75rem", fontWeight: "bold" },
  empty: { color: "#888", fontSize: "0.9rem" },
  viewAll: { display: "block", marginTop: "1rem", color: "#4f46e5", fontSize: "0.85rem", textDecoration: "none" },
};

export default Dashboard;
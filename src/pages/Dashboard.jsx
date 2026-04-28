import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ leads: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [leadsRes, customersRes] = await Promise.all([
          API.get("/leads"),
          API.get("/customers"),
        ]);
        setStats({
          leads: leadsRes.data.count,
          customers: customersRes.data.count,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome back, {user?.name} 👋</h1>
      <p style={styles.sub}>Here's your sales overview</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.cards}>
          <div style={styles.card}>
            <h2 style={styles.number}>{stats.leads}</h2>
            <p style={styles.label}>Total Leads</p>
          </div>
          <div style={styles.card}>
            <h2 style={styles.number}>{stats.customers}</h2>
            <p style={styles.label}>Total Customers</p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "0.5rem",
  },
  sub: {
    color: "#666",
    marginBottom: "2rem",
  },
  cards: {
    display: "flex",
    gap: "1.5rem",
  },
  card: {
    background: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    flex: 1,
    textAlign: "center",
  },
  number: {
    fontSize: "3rem",
    color: "#4f46e5",
    marginBottom: "0.5rem",
  },
  label: {
    color: "#666",
    fontSize: "1rem",
  },
};

export default Dashboard;
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.brandLink}>Sales CRM</Link>
      </div>

      {user && (
        <>
          <div style={styles.links}>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/leads" style={styles.link}>Leads</Link>
            <Link to="/customers" style={styles.link}>Customers</Link>
          </div>

          <div style={styles.right}>
            <span style={styles.userInfo}>
              {user.name} · <span style={styles.role}>{user.role}</span>
            </span>
            <button onClick={handleLogout} style={styles.button}>
              Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    height: "60px",
    backgroundColor: "#4f46e5",
    color: "white",
  },
  brand: {
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  brandLink: {
    color: "white",
    textDecoration: "none",
  },
  links: {
    display: "flex",
    gap: "1.5rem",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userInfo: {
    fontSize: "0.9rem",
  },
  role: {
    opacity: 0.75,
    fontSize: "0.8rem",
  },
  button: {
    padding: "0.4rem 1rem",
    backgroundColor: "white",
    color: "#4f46e5",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Navbar;
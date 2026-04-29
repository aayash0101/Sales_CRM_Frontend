import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Register = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await API.post("/auth/register", formData);
            login(res.data.user, res.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>CRM Sign Up</h2>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label>Username</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="john doe"
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="john@test.com"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="••••••"
                            required
                        />
                    </div>
                    <button type="submit" style={styles.button} disabled={Loading}>
                        {Loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p style={styles.link}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
    },
    card: {
        background: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
    },
    title: {
        marginBottom: "1.5rem",
        textAlign: "center",
        color: "#333",
    },
    field: {
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
    },
    input: {
        padding: "0.6rem",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "1rem",
    },
    button: {
        width: "100%",
        padding: "0.75rem",
        backgroundColor: "#4f46e5",
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontSize: "1rem",
        cursor: "pointer",
        marginTop: "0.5rem",
    },
    error: {
        color: "red",
        marginBottom: "1rem",
        textAlign: "center",
    },
    link: {
        textAlign: "center",
        marginTop: "1rem",
        fontSize: "0.9rem",
    },
};

export default Register;



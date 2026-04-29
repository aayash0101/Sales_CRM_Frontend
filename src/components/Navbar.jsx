import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/leads", label: "Leads" },
    { path: "/customers", label: "Customers" },
    { path: "/deals", label: "Deals" },
  ];

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/dashboard" className="text-xl font-bold tracking-tight">
          Sales CRM
        </Link>

        {user && (
          <>
            {/* Nav Links */}
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-opacity ${
                    location.pathname === link.path
                      ? "opacity-100 border-b-2 border-white pb-0.5"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs opacity-60 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white text-indigo-600 text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
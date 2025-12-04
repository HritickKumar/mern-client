import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav
            style={{
                padding: "0.75rem 1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#111827",
                color: "white",
            }}
        >
            <div>
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                    <strong>MERN Auth</strong>
                </Link>
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                    Home
                </Link>
                {user && (
                    <>
                        <Link
                            to="/dashboard"
                            style={{ color: "white", textDecoration: "none" }}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/profile"
                            style={{ color: "white", textDecoration: "none" }}
                        >
                            Profile
                        </Link>
                        {user.roles?.includes("admin") && (
                            <Link
                                to="/admin/users"
                                style={{ color: "white", textDecoration: "none" }}
                            >
                                Admin
                            </Link>
                        )}
                    </>
                )}
                {!user ? (
                    <>
                        <Link
                            to="/login"
                            style={{ color: "white", textDecoration: "none" }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            style={{ color: "white", textDecoration: "none" }}
                        >
                            Register
                        </Link>
                    </>
                ) : (
                    <button
                        onClick={logout}
                        style={{
                            background: "#EF4444",
                            color: "white",
                            border: "none",
                            padding: "0.4rem 0.8rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

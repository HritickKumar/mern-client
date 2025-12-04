import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "", name: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.email || !form.password) {
            setError("Email and password are required");
            return;
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        try {
            await register(form);
            setSuccess("Registered successfully. Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "2rem auto" }}>
            <h2>Register</h2>
            <form onSubmit={onSubmit}>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <div style={{ marginBottom: "1rem" }}>
                    <label>Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Name</label>
                    <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={onChange}
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Password</label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={onChange}
                        style={{ width: "100%" }}
                    />
                </div>

                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;

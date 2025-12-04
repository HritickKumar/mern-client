import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

const Login = () => {
    const { loginWithPassword } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: normal, 2: mfa
    const [form, setForm] = useState({
        email: "",
        password: "",
        mfaToken: "",
    });
    const [error, setError] = useState("");

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Email and password are required");
            return;
        }

        try {
            // First try without MFA token
            const res = await api.post("/auth/login", {
                email: form.email,
                password: form.password,
            });

            if (res.status === 206 || res.data.mfaRequired) {
                // Server asking for MFA token
                setStep(2);
                return;
            }

            const { accessToken, refreshToken, user } = res.data.data;
            // simulate same logic as in context
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            window.location.href = "/dashboard";
        } catch (err) {
            const msg =
                err.response?.data?.message || "Login failed, please check credentials";
            setError(msg);
        }
    };

    const handleLoginWithMFA = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.mfaToken) {
            setError("MFA token is required");
            return;
        }

        try {
            await loginWithPassword({
                email: form.email,
                password: form.password,
                mfaToken: form.mfaToken,
            });
            navigate("/dashboard");
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                "MFA login failed, please try again";
            setError(msg);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "2rem auto" }}>
            <h2>Login</h2>
            {step === 1 && (
                <form onSubmit={handleLogin}>
                    {error && <p style={{ color: "red" }}>{error}</p>}

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
                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={onChange}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button type="submit">Login</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleLoginWithMFA}>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <p>MFA is enabled for this account. Please enter the code.</p>

                    <div style={{ marginBottom: "1rem" }}>
                        <label>MFA Token</label>
                        <input
                            name="mfaToken"
                            type="text"
                            value={form.mfaToken}
                            onChange={onChange}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button type="submit">Verify & Login</button>
                </form>
            )}

            <div style={{ marginTop: "1rem" }}>
                <Link to="/otp-login">Login with OTP instead</Link>
            </div>
        </div>
    );
};

export default Login;

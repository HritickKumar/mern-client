import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

const OTPLogin = () => {
    const { loginWithOTP } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const sendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError("Email is required");
            return;
        }

        try {
            const res = await api.post("/auth/otp/request", { email });
            setMessage(res.data.message || "OTP sent if account exists.");
            setStep(2);
        } catch (err) {
            setError("Failed to send OTP");
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!otp) {
            setError("OTP is required");
            return;
        }

        try {
            await loginWithOTP({ email, otp });
            navigate("/dashboard");
        } catch (err) {
            const msg =
                err.response?.data?.message || err.message || "OTP verification failed";
            setError(msg);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "2rem auto" }}>
            <h2>Login with OTP</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            {step === 1 && (
                <form onSubmit={sendOtp}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            style={{ width: "100%" }}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type="submit">Send OTP</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={verifyOtp}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label>Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            style={{ width: "100%" }}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <button type="submit">Verify & Login</button>
                </form>
            )}
        </div>
    );
};

export default OTPLogin;

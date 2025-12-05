import { useEffect, useState, useRef } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
    const { user, setUser } = useAuth();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [mfaToken, setMfaToken] = useState("");
    const [imgFile, setImgFile] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) return;
        const load = async () => {
            setLoading(true);
            try {
                const res = await api.get("/users/me");
                setUser(res.data.data);
            } catch {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const refreshMe = async () => {
        try {
            const res = await api.get("/users/me");
            setUser(res.data.data);
        } catch (err) {
            setError("Failed to refresh profile");
        }
    };

    const initiateMFA = async () => {
        setError(""); setMessage("");
        setActionLoading(true);
        try {
            const res = await api.post("/auth/mfa/initiate");
            setQrDataUrl(res.data.data.qrCodeDataUrl);
            setMessage("Scan the QR code with your authenticator app");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to initiate MFA");
        } finally {
            setActionLoading(false);
        }
    };

    const confirmMFA = async () => {
        if (!mfaToken.trim()) return setError("Enter the 6-digit code");
        setActionLoading(true);
        try {
            await api.post("/auth/mfa/confirm", { token: mfaToken.trim() });
            setMessage("MFA enabled successfully!");
            setQrDataUrl(""); setMfaToken("");
            await refreshMe();
        } catch (err) {
            setError(err.response?.data?.message || "Invalid token");
        } finally {
            setActionLoading(false);
        }
    };

    const disableMFA = async () => {
        setActionLoading(true);
        try {
            await api.post("/auth/mfa/disable");
            setMessage("MFA disabled");
            await refreshMe();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to disable MFA");
        } finally {
            setActionLoading(false);
        }
    };

    const onImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1024 * 1024) {
            setError("Image must be < 1MB");
            return;
        }
        setImgFile(file);
        setError(""); setMessage("");
    };

    const uploadImage = async () => {
        if (!imgFile) return;
        setActionLoading(true);
        const formData = new FormData();
        formData.append("image", imgFile);

        try {
            const res = await api.post("/users/me/profile-image", formData);
            setUser(res.data.data);
            setMessage("Profile picture updated!");
            setImgFile(null);

            fileInputRef.current.value = "";
        } catch (err) {
            setError(err.response?.data?.message || "Upload failed");
        } finally {
            setActionLoading(false);
        }
    };

    const clearImage = () => {
        setImgFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (loading || !user) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading profile...</div>;

    return (
        <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
            <h2>Profile</h2>

            {error && <p style={{ color: "red", background: "#fee", padding: "0.5rem", borderRadius: 6 }}>{error}</p>}
            {message && <p style={{ color: "green", background: "#f0fff4", padding: "0.5rem", borderRadius: 6 }}>{message}</p>}

            <div style={{ lineHeight: "2rem" }}>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Name:</strong> {user.name || "-"}</div>
                <div><strong>Roles:</strong> {user.roles?.join(", ") || "user"}</div>
                <div><strong>MFA:</strong> {user.isMFAEnabled ? "Enabled" : "Disabled"}</div>
            </div>

            <hr style={{ margin: "2rem 0" }} />

            {/* MFA Section */}
            <section>
                <h3>Two-Factor Authentication (MFA)</h3>

                {!user.isMFAEnabled ? (
                    <>
                        <button onClick={initiateMFA} disabled={actionLoading}>
                            {actionLoading ? "Loading..." : "Enable MFA"}
                        </button>

                        {qrDataUrl && (
                            <div style={{ marginTop: "1rem", padding: "1rem", background: "#f9f9f9", borderRadius: 8 }}>
                                <img src={qrDataUrl} alt="MFA QR Code" style={{ display: "block", margin: "0 auto 1rem" }} />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={mfaToken}
                                    onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    maxLength={6}
                                    style={{ width: 120, textAlign: "center", padding: "0.5rem" }}
                                />
                                <button onClick={confirmMFA} disabled={actionLoading || mfaToken.length < 6} style={{ marginLeft: 8 }}>
                                    Confirm
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <button onClick={disableMFA} disabled={actionLoading} style={{ background: "#d32f2f", color: "white" }}>
                        Disable MFA
                    </button>
                )}
            </section>

            <hr style={{ margin: "2rem 0" }} />

            {/* Profile Image */}
            <section>
                <h3>Profile Picture</h3>
                {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                    <div style={{ width: 120, height: 120, background: "#ddd", borderRadius: "50%" }} />
                )}

                <div style={{ marginTop: "1rem" }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        disabled={actionLoading}
                    />
                    {imgFile && (
                        <>
                            <button onClick={uploadImage} disabled={actionLoading} style={{ marginLeft: 8 }}>
                                {actionLoading ? "Uploading..." : "Upload"}
                            </button>
                            <button onClick={clearImage} style={{ marginLeft: 8 }}>Cancel</button>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Profile;

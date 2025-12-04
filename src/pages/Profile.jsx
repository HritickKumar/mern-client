import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
    const { user, setUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [mfaSecret, setMfaSecret] = useState("");
    const [mfaToken, setMfaToken] = useState("");
    const [imgFile, setImgFile] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const refreshMe = async () => {
        const res = await api.get("/users/me");
        setUser(res.data.data);
    };

    const initiateMFA = async () => {
        setError("");
        setMessage("");
        try {
            const res = await api.post("/auth/mfa/initiate");
            setQrDataUrl(res.data.data.qrCodeDataUrl);
            setMfaSecret(res.data.data.secret);
            setMessage("Scan the QR with your Authenticator app, then enter the token.");
        } catch (err) {
            setError("Failed to initiate MFA");
        }
    };

    const confirmMFA = async () => {
        setError("");
        setMessage("");
        if (!mfaToken) {
            setError("Please enter MFA token");
            return;
        }
        try {
            await api.post("/auth/mfa/confirm", { token: mfaToken });
            setMessage("MFA enabled successfully");
            setQrDataUrl("");
            setMfaSecret("");
            setMfaToken("");
            await refreshMe();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to confirm MFA");
        }
    };

    const disableMFA = async () => {
        setError("");
        setMessage("");
        try {
            await api.post("/auth/mfa/disable");
            setMessage("MFA disabled");
            await refreshMe();
        } catch (err) {
            setError("Failed to disable MFA");
        }
    };

    const onImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file && file.size > 1024 * 1024) {
            setError("Image must be less than 1MB");
            return;
        }
        setImgFile(file || null);
    };

    const uploadImage = async () => {
        setError("");
        setMessage("");
        if (!imgFile) {
            setError("Please choose an image");
            return;
        }
        const formData = new FormData();
        formData.append("image", imgFile);

        try {
            const res = await api.post("/users/me/profile-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage("Profile image updated");
            setImgFile(null);
            setUser(res.data.data);
        } catch (err) {
            setError("Failed to upload image");
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Profile</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}

            <div style={{ marginBottom: "1rem" }}>
                <strong>Email:</strong> {user.email}
            </div>
            <div style={{ marginBottom: "1rem" }}>
                <strong>Name:</strong> {user.name}
            </div>
            <div style={{ marginBottom: "1rem" }}>
                <strong>Roles:</strong> {user.roles?.join(", ")}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
                <strong>MFA Enabled:</strong> {user.isMFAEnabled ? "Yes" : "No"}
                <div style={{ marginTop: "0.5rem" }}>
                    {!user.isMFAEnabled ? (
                        <>
                            <button onClick={initiateMFA}>Enable MFA</button>
                            {qrDataUrl && (
                                <div style={{ marginTop: "1rem" }}>
                                    <p>Scan this QR in Google Authenticator or Authy:</p>
                                    <img src={qrDataUrl} alt="MFA QR" style={{ width: 200 }} />
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <label>Enter token from app:</label>
                                        <input
                                            type="text"
                                            value={mfaToken}
                                            onChange={(e) => setMfaToken(e.target.value)}
                                            style={{ marginLeft: "0.5rem" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={confirmMFA}
                                            style={{ marginLeft: "0.5rem" }}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <button onClick={disableMFA}>Disable MFA</button>
                    )}
                </div>
            </div>

            <hr />

            <div style={{ marginTop: "1.5rem" }}>
                <h3>Profile Image</h3>
                {user.profileImageUrl && (
                    <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        style={{ width: 120, height: 120, borderRadius: "50%" }}
                    />
                )}
                <div style={{ marginTop: "0.5rem" }}>
                    <input type="file" accept="image/*" onChange={onImageChange} />
                    <button type="button" onClick={uploadImage} style={{ marginLeft: 8 }}>
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;

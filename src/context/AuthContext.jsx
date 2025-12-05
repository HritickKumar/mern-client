import { createContext, useContext, useEffect, useState } from "react";
import api, { authStorage } from "../api/axiosInstance";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = authStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const result = await api.get("/users/me");
        setUser(result.data.data);
      } catch {
        authStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loginWithPassword = async ({ email, password, mfaToken }) => {
    const body = { email, password };
    if (mfaToken) body.mfaToken = mfaToken;

    const result = await api.post("/auth/login", body);

    if (!result.data.success) throw new Error(result.data.message);

    const { accessToken, refreshToken, user } = result.data.data;

    authStorage.setTokens(accessToken, refreshToken);
    setUser(user);
    return user;
  };

  const loginWithOTP = async ({ email, otp }) => {
    const cleanOtp = String(otp).trim();
    if (!cleanOtp || cleanOtp.length < 4 || cleanOtp.length > 8) {
      throw new Error("Please enter a valid OTP");
    }
    const payload = {
      email: email.trim().toLowerCase(),
      code: cleanOtp,

    };
    try {
      const res = await api.post("/auth/otp/verify", payload);

      const { accessToken, refreshToken, user } = res.data.data;
      authStorage.setTokens(accessToken, refreshToken);
      setUser(user);
      return user;
    } catch (err) {
      console.error("OTP verification failed:", err.response?.data);
      throw new Error(err.response?.data?.message || "Invalid or expired OTP");
    }

  };

  const register = async ({ email, password, name }) => {
    const result = await api.post("/auth/register", { email, password, name });
    return result.data;
  };

  const logout = async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error('Auth init failed', error);
    }
    authStorage.clear();
    setUser(null);
  };


  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    loginWithPassword,
    loginWithOTP,
    logout,
    setUser, // for profile updates
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
          <div>Loading...</div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

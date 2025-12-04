import { createContext, useContext, useEffect, useState } from "react";
import api, { authStorage } from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // {id,email,name,roles,isMFAEnabled}
  const [loading, setLoading] = useState(true);

  // On mount, try to fetch /users/me using existing access token
  useEffect(() => {
    const init = async () => {
      const token = authStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/users/me");
        setUser(res.data.data);
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

    const res = await api.post("/auth/login", body);

    // If backend sends mfaRequired (status 206), handle in page, not here.
    if (!res.data.success) throw new Error(res.data.message);

    const { accessToken, refreshToken, user } = res.data.data;

    authStorage.setTokens(accessToken, refreshToken);
    setUser(user);
    return user;
  };

  const loginWithOTP = async ({ email, otp }) => {
    const res = await api.post("/auth/otp/verify", { email, otp });
    const { accessToken, refreshToken, user } = res.data.data;

    authStorage.setTokens(accessToken, refreshToken);
    setUser(user);
    return user;
  };

  const register = async ({ email, password, name }) => {
    const res = await api.post("/auth/register", { email, password, name });
    return res.data;
  };

  const logout = async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (e) {
      // ignore
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
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

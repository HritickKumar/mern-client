import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import OTPLogin from "./pages/OTPLogin";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import ChatButton from "./components/ChatButton";
import { useAuth } from "./context/AuthContext";
import AdminChatPage from "./admin/AdminChatPage";



const App = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-login" element={<OTPLogin />} />

        {/* Authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

        </Route>

        {/* Admin-only routes */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/chat" element={<AdminChatPage />} />
        </Route>
      </Routes>
      {user && user.roles.includes("user") && <ChatButton />}
      {/* {user && user.roles.includes("admin") && <AdminChatButton />} */}

    </>
  );
};

export default App;

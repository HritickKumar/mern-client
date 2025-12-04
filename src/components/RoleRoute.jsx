import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    const hasRole = user.roles?.some((r) => allowedRoles.includes(r));
    if (!hasRole) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default RoleRoute;

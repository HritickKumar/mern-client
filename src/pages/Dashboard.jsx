import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Dashboard</h2>
            <p>Welcome, {user?.name || user?.email}!</p>
            <p>Your roles: {user?.roles?.join(", ")}</p>
        </div>
    );
};

export default Dashboard;

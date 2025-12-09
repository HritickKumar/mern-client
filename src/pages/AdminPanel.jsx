import { Link } from "react-router-dom";

const AdminPanel = () => {
    return (
        <div style={{ padding: "2rem" }}>
            <h1>Admin Panel</h1>
            <ul>
                <li><Link to="/admin/users">Manage Users</Link></li>
                {/* add links for audit logs, system settings, etc */}
            </ul>
        </div>
    );
};

export default AdminPanel;

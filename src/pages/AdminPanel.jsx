import { Link } from "react-router-dom";

const AdminPanel = () => {
    const sendMessageToUser = (userId, message) => {
        getSocket().emit("admin:sendUserMessage", { userId, message });
    };

    return (

        <div style={{ padding: "2rem" }}>
            <h1>Admin Panel</h1>
            <ul>
                <li><Link to="/admin/users">Manage Users</Link></li>
                {/* add links for audit logs, system settings, etc */}
            </ul>
            <button onClick={() => sendMessageToUser(u._id, "Hello from Admin!")}>
                Send Message
            </button>

        </div>
    );
};

export default AdminPanel;

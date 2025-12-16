import { Link } from "react-router-dom";

const AdminChatButton = () => {
    return (
        <Link
            to="/admin/chat"
            style={{
                padding: "8px 14px",
                background: "#4A90E2",
                color: "#fff",
                borderRadius: "6px",
                textDecoration: "none",
            }}
        >
            Admin Chat
        </Link>
    );
};

export default AdminChatButton;

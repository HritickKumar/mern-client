import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AdminChatList = ({ onSelectChat }) => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const loadChats = async () => {
            const res = await api.get("/chat/list");
            setChats(res.data.data);
        };
        loadChats();
    }, []);

    return (
        <div style={{ width: "280px", borderRight: "1px solid #ddd" }}>
            <h3 style={{ padding: "10px" }}>User Chats</h3>

            {chats.map((chat) => {
                const user = chat.participants.find(
                    (p) => p.roles?.includes("user")
                );

                return (
                    <div
                        key={chat._id}
                        onClick={() => onSelectChat(chat)}
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                        }}
                    >
                        <b>{user?.name}</b>
                        <p style={{ fontSize: "12px", color: "#666" }}>
                            {chat.lastMessage}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminChatList;

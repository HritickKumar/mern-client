import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { getSocket, sendChatMessage } from "../socket";

const AdminChatWindow = ({ chat }) => {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const user = chat.participants.find((p) =>
        p.roles?.includes("user")
    );

    // load messages once
    useEffect(() => {
        const loadMessages = async () => {
            const res = await api.get(`/chat/${chat._id}/messages`);
            setMessages(res.data.data);
        };
        loadMessages();
    }, [chat]);

    // socket listener
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on("chat:newMessage", (msg) => {
            if (msg.chatId !== chat._id) return;

            setMessages((prev) => {
                if (prev.some((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        });

        return () => socket.off("chat:newMessage");
    }, [chat]);

    const send = () => {
        if (!text.trim()) return;

        sendChatMessage({
            chatId: chat._id,
            receiverId: user._id,
            text,
        });

        setText("");
    };

    return (
        <div style={{ flex: 1, padding: "15px" }}>
            <h3>Chat with {user?.name}</h3>

            <div style={{ height: "60vh", overflowY: "auto" }}>
                {messages.map((m) => (
                    <div key={m._id}>
                        <b>{m.sender === user._id ? user.name : "Admin"}:</b>{" "}
                        {m.text}
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ flex: 1 }}
                    placeholder="Reply to user..."
                />
                <button onClick={send}>Send</button>
            </div>
        </div>
    );
};

export default AdminChatWindow;

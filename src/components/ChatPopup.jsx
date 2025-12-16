import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { getSocket, sendChatMessage } from "../socket";

const ChatPopup = () => {
    const [chat, setChat] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        let mounted = true;

        const initChat = async () => {
            const adminRes = await api.get("/auth/admin-id");
            const adminId = adminRes.data.adminId;

            const chatRes = await api.post("/chat/create", {
                otherUserId: adminId,
            });

            if (!mounted) return;

            const chatData = chatRes.data.data;
            setChat(chatData);

            const msgs = await api.get(`/chat/${chatData._id}/messages`);
            setMessages(msgs.data.data || []);

            const adminUser = chatData.participants.find(
                p => p.roles?.includes("admin")
            );
            setAdmin(adminUser);
        };

        initChat();

        return () => {
            mounted = false;
        };
    }, []);


    // SOCKET LISTENERS
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on("chat:newMessage", (msg) => {
            if (msg.chatId !== chat?._id) return;

            setMessages((prev) => {
                if (prev.some((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        });

        socket.on("chat:notification", (data) => {
            console.log("🔔 New message notification", data);
        });

        return () => {
            socket.off("chat:newMessage");
            socket.off("chat:notification");
        };
    }, [chat]);

    const send = () => {
        if (!text.trim()) return;

        sendChatMessage({
            chatId: chat._id,
            receiverId: admin._id,
            text,
        });

        setText("");
    };



    return (
        <div>


            <h3>Chat with Admin</h3>

            {messages
                .filter(m => m && m.text && m.sender)
                .map(m => (

                    <div key={m._id}>
                        <b>{m.sender === admin._id ? "Admin" : "You"}:</b> {m.text}
                    </div>
                ))}


            <input value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={send}>Send</button>
        </div>
    );
};

export default ChatPopup;

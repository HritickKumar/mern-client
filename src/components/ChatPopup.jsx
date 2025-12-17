import { useEffect, useState, useRef } from "react";
import api from "../api/axiosInstance";
import { getSocket, sendChatMessage } from "../socket";
import { useAuth } from "../context/AuthContext";

const ChatPopup = ({ onClose }) => {
    const { user } = useAuth();
    const [chat, setChat] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        let mounted = true;

        const initChat = async () => {
            try {
                setLoading(true);
                setError("");

                const adminRes = await api.get("/auth/admin-id");
                const adminId = adminRes.data.adminId;

                const chatRes = await api.post("/chat/create", {
                    otherUserId: adminId,
                });

                if (!mounted) return;

                const chatData = chatRes.data.data;
                setChat(chatData);

                const msgsRes = await api.get(`/chat/${chatData._id}/messages`);
                const loadedMessages = msgsRes.data.data || [];

                const sortedMessages = loadedMessages.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                setMessages(sortedMessages);

                const adminUser = chatData.participants.find((p) =>
                    p.roles?.includes("admin")
                );
                setAdmin(adminUser);
            } catch (err) {
                console.error("Chat init error:", err);
                setError("Failed to load chat. Please refresh or try again later.");
            } finally {
                setLoading(false);
            }
        };

        initChat();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !chat) return;

        const handleNewMessage = (msg) => {
            if (msg.chatId !== chat._id) return;

            setMessages((prev) => {
                if (prev.some((m) => m._id === msg._id)) return prev;

                return [...prev, msg].sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
            });
        };

        socket.on("chat:newMessage", handleNewMessage);
        socket.on("chat:notification", (data) =>
            console.log("🔔 Notification:", data)
        );

        return () => {
            socket.off("chat:newMessage", handleNewMessage);
            socket.off("chat:notification");
        };
    }, [chat]);

    const send = () => {
        if (!text.trim() || !chat || !admin || !user) return;

        const messageText = text.trim();



        sendChatMessage({
            chatId: chat._id,
            receiverId: admin._id,
            text: messageText,
        });

        setText("");
    };

    if (loading) {
        return <div style={{ padding: 20, textAlign: "center" }}>Loading chat...</div>;
    }

    if (error) {
        return <div style={{ padding: 20, color: "red", textAlign: "center" }}>{error}</div>;
    }

    return (
        <div
            style={{
                width: 380,
                height: 500,
                border: "1px solid #ccc",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
        >

            <div
                style={{
                    padding: "12px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    fontWeight: "bold",
                    fontSize: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span>Chat with Admin</span>
                <button
                    onClick={onClose} // This comes from props
                    style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        fontSize: 24,
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 1,
                    }}
                >
                    &times;
                </button>
            </div>


            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                {messages
                    .filter((m) => m && m.text)
                    .map((m) => {
                        const senderId =
                            typeof m.sender === "string" ? m.sender : m.sender?._id;

                        const isFromMe = senderId === user?._id;

                        return (
                            <div
                                key={m._id}
                                style={{
                                    alignSelf: isFromMe ? "flex-end" : "flex-start",
                                    maxWidth: "80%",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: isFromMe ? "#007bff" : "#28a745",
                                        color: "white",
                                        padding: "10px 14px",
                                        borderRadius: 18,
                                        borderTopLeftRadius: isFromMe ? 18 : 4,
                                        borderTopRightRadius: isFromMe ? 4 : 18,
                                        wordBreak: "break-word",
                                    }}
                                >
                                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                                        {isFromMe ? "You" : "Admin"}
                                    </div>
                                    {m.text}
                                </div>
                            </div>
                        );
                    })}
                <div ref={messagesEndRef} />
            </div>


            <div
                style={{
                    padding: "10px 16px",
                    borderTop: "1px solid #eee",
                    display: "flex",
                    gap: 8,
                }}
            >
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 20,
                        border: "1px solid #ccc",
                        outline: "none",
                        fontSize: 14,
                    }}
                />
                <button
                    onClick={send}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: 20,
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatPopup;
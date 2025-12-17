import { useEffect, useState, useRef } from "react";
import api from "../api/axiosInstance";
import { getSocket, sendChatMessage } from "../socket";
import { useAuth } from "../context/AuthContext";

const AdminChatWindow = ({ chat }) => {
    const { user: currentAdmin } = useAuth();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // Find the regular user in this chat
    const user = chat.participants.find((p) => p.roles?.includes("user"));

    // Auto-scroll to bottom whenever messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load previous messages when chat is selected
    useEffect(() => {
        const loadMessages = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/chat/${chat._id}/messages`);
                const loadedMessages = res.data.data || [];

                // Sort by creation time (oldest first)
                const sorted = loadedMessages.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
                setMessages(sorted);
            } catch (err) {
                console.error("Failed to load messages:", err);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [chat]);

    // Socket: listen for new messages in real time
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNewMessage = (msg) => {
            if (msg.chatId !== chat._id) return;

            setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((m) => m._id === msg._id)) return prev;

                return [...prev, msg].sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
            });
        };

        socket.on("chat:newMessage", handleNewMessage);

        return () => {
            socket.off("chat:newMessage", handleNewMessage);
        };
    }, [chat]);

    // Send message
    const send = () => {
        if (!text.trim() || !user) return;

        const messageText = text.trim();

        sendChatMessage({
            chatId: chat._id,
            receiverId: user._id,
            text: messageText,
        });

        setText(""); // Clear input immediately
    };

    return (
        <div
            style={{
                flex: 1,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f5f5f5",
                borderRadius: 12,
                height: "100%",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "12px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 10,
                }}
            >
                Chat with {user?.name || "User"}
            </div>

            {/* Messages Area */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888", padding: 20 }}>
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages
                        .filter((m) => m && m.text)
                        .map((m) => {
                            // Safely get sender ID (string or object)
                            const senderId =
                                typeof m.sender === "string" ? m.sender : m.sender?._id;

                            const isFromUser = senderId === user?._id;

                            return (
                                <div
                                    key={m._id}
                                    style={{
                                        alignSelf: isFromUser ? "flex-start" : "flex-end",
                                        maxWidth: "80%",
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: isFromUser ? "#ffffff" : "#007bff",
                                            color: isFromUser ? "#000" : "#fff",
                                            padding: "10px 16px",
                                            borderRadius: 18,
                                            borderTopLeftRadius: isFromUser ? 4 : 18,
                                            borderTopRightRadius: isFromUser ? 18 : 4,
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                                            <b>{isFromUser ? user?.name || "User" : "You (Admin)"}</b>
                                        </div>
                                        {m.text}
                                    </div>
                                </div>
                            );
                        })
                )}

                {/* Invisible anchor for scrolling */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
                style={{
                    padding: "12px 0",
                    display: "flex",
                    gap: 10,
                    marginTop: 10,
                    borderTop: "1px solid #ddd",
                    paddingTop: 15,
                }}
            >
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())
                    }
                    placeholder="Type your reply..."
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 25,
                        border: "1px solid #ccc",
                        fontSize: 15,
                        outline: "none",
                    }}
                />
                <button
                    onClick={send}
                    style={{
                        padding: "12px 24px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 25,
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: 15,
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default AdminChatWindow;
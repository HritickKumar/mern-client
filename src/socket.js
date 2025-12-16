import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
    if (socket && socket.connected) return socket;

    socket = io("http://localhost:5000", {
        auth: { token },
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected");
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Socket error:", err.message);
    });

    return socket;
};

export const getSocket = () => socket;

export const sendChatMessage = (payload) => {
    if (!socket || !socket.connected) return;
    socket.emit("chat:send", payload);
};

import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
    if (socket && socket.connected) return socket;

    socket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
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
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("Socket disconnected");
    }
};
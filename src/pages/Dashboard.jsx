import { useEffect, useState } from "react";
import { getSocket } from "../socket";

const Dashboard = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on("server:userMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("user:online", (data) => {
            console.log("User online:", data.userId);
        });

        socket.on("user:offline", (data) => {
            console.log("User offline:", data.userId);
        });

        return () => {
            socket.off("server:userMessage");
            socket.off("user:online");
            socket.off("user:offline");
        };
    }, []);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Dashboard (Real-Time Enabled)</h2>

            <h3>Messages:</h3>
            {messages.map((m, i) => (
                <p key={i}>{m.message}</p>
            ))}
        </div>
    );
};

export default Dashboard;

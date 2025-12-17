import { useState } from "react";
import AdminChatList from "./AdminChatList";
import AdminChatWindow from "./AdminChatWindow";

const AdminChatPage = () => {
    const [selectedChat, setSelectedChat] = useState(null);

    return (
        <div
            style={{
                height: "calc(100vh - 80px)",   // Subtract navbar height
                display: "flex",
                marginTop: "70px",              // Push below navbar
                position: "fixed",              // Optional: lock it in place
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#f0f2f5",
            }}
        >
            <div style={{ width: "320px", borderRight: "1px solid #ddd", backgroundColor: "#fff" }}>
                <AdminChatList onSelectChat={setSelectedChat} />
            </div>

            <div style={{ flex: 1, display: "flex", backgroundColor: "#f9f9f9" }}>
                {selectedChat ? (
                    <AdminChatWindow chat={selectedChat} />
                ) : (
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#888",
                            fontSize: 18,
                        }}
                    >
                        ← Select a user from the list to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChatPage;
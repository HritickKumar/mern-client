import { useState } from "react";
import AdminChatList from "./AdminChatList";
import AdminChatWindow from "./AdminChatWindow";

const AdminChatPage = () => {
    const [selectedChat, setSelectedChat] = useState(null);

    return (
        <div style={{ display: "flex", height: "80vh" }}>
            <AdminChatList onSelectChat={setSelectedChat} />

            {selectedChat ? (
                <AdminChatWindow chat={selectedChat} />
            ) : (
                <div style={{ padding: "20px" }}>
                    Select a user to start chatting
                </div>
            )}
        </div>
    );
};

export default AdminChatPage;

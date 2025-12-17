import { useState } from "react";
import ChatPopup from "./ChatPopup"
// import { FaCommentDots } from "react-icons/fa"; 

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <>
            {/* Floating Button - always visible for users */}
            <div
                onClick={toggleChat}
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    width: 60,
                    height: 60,
                    backgroundColor: "#007bff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 1000,
                    color: "white",
                    fontSize: 30,
                }}
            >
                {/* <FaCommentDots /> */}
                {/* You can use any icon or <span>💬</span> */}
            </div>

            {/* Chat Popup - appears above the button when open */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 90, // Above the button
                        right: 20,
                        zIndex: 1000,
                    }}
                >
                    <ChatPopup onClose={toggleChat} /> {/* Pass close function */}
                </div>
            )}
        </>
    );
};

export default ChatWidget;
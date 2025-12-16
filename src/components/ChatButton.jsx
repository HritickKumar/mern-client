import { useState } from "react";
import ChatPopup from "./ChatPopup";

const ChatButton = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Floating button */}
            <div
                onClick={() => setOpen(true)}
                style={{
                    position: "fixed",
                    bottom: "25px",
                    right: "25px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#4A90E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "28px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    zIndex: 1000,
                }}
            >
                💬
            </div>

            {/* Chat popup */}
            {open && <ChatPopup onClose={() => setOpen(false)} />}
        </>
    );
};

export default ChatButton;

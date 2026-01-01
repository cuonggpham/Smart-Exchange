import { useState } from "react";
import type { DisplayMessage as Message } from "./ChatArea";
import avatarUser from "../../assets/avatar-user.png";
import avatarOther from "../../assets/avatar-other.png";

interface Props {
    msg: Message;
    onDelete?: (messageId: string) => void;
}

export default function MessageBubble({ msg, onDelete }: Props) {
    const [showActions, setShowActions] = useState(false);
    const isUser = msg.sender === "user";

    return (
        <div
            className={`bubble-row ${isUser ? "right" : "left"}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <img src={isUser ? avatarUser : avatarOther} className="avatar" alt="avatar" />
            <div className="bubble-wrapper">
                <div className="bubble">
                    {msg.text}
                    {isUser && showActions && onDelete && (
                        <button
                            className="delete-msg-btn"
                            onClick={() => onDelete(msg.id)}
                            title="Xóa tin nhắn"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="timestamp">{msg.timestamp}</div>
            </div>
        </div>
    );
}

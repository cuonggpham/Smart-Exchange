import MessageBubble from "./MessageBubble";
import type { DisplayMessage as Message } from "./ChatArea";

interface Props {
    messages: Message[];
    onDeleteMessage?: (messageId: string) => void;
}

export default function MsgList({ messages, onDeleteMessage }: Props) {
    return (
        <div className="msg-list">
            {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} onDelete={onDeleteMessage} />
            ))}
        </div>
    );
}

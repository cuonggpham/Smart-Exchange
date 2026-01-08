import { useTranslation } from "react-i18next";
import MessageBubble from "./MessageBubble";
import type { DisplayMessage as Message } from "./ChatArea";
import "../../styles/ChatPage.css";

interface Props {
    messages: Message[];
    onDeleteMessage?: (messageId: string) => void;
}

// Time gap threshold in milliseconds (30 minutes)
const TIME_GAP_THRESHOLD = 30 * 60 * 1000;

// Helper function to format time divider based on context
function formatTimeDivider(date: Date, t: (key: string) => string, language: string): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString(language === "vi" ? "vi-VN" : "ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
    });

    if (isToday) {
        return `${t("chat.sidebar.time.today")} ${timeStr}`;
    }
    if (isYesterday) {
        return `${t("chat.sidebar.time.yesterday")} ${timeStr}`;
    }

    // For older dates, show the full date with time
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
    };

    const dateStr = date.toLocaleDateString(language === "vi" ? "vi-VN" : "ja-JP", dateOptions);
    return `${dateStr} ${timeStr}`;
}

// Check if time gap between two dates exceeds threshold
function shouldShowDivider(prevDate: Date | null, currentDate: Date): boolean {
    if (!prevDate) return true;
    return currentDate.getTime() - prevDate.getTime() > TIME_GAP_THRESHOLD;
}

export default function MsgList({ messages, onDeleteMessage }: Props) {
    const { t, i18n } = useTranslation();

    // Group messages by 30-minute intervals and render with dividers
    const renderMessagesWithDividers = () => {
        const elements: React.ReactNode[] = [];
        let lastMessageTime: Date | null = null;

        messages.forEach((msg, index) => {
            const currentTime = msg.createdAt;

            // Add divider if time gap exceeds 30 minutes
            if (shouldShowDivider(lastMessageTime, currentTime)) {
                elements.push(
                    <div key={`divider-${index}`} className="time-divider">
                        <span className="time-divider-text">
                            {formatTimeDivider(currentTime, t, i18n.language)}
                        </span>
                    </div>
                );
            }

            lastMessageTime = currentTime;

            elements.push(
                <MessageBubble
                    key={msg.id}
                    msg={msg}
                    onDelete={onDeleteMessage}
                />
            );
        });

        return elements;
    };

    return (
        <div className="msg-list">
            {renderMessagesWithDividers()}
        </div>
    );
}

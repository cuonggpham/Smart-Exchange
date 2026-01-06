import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../styles/ChatPage.css";
import ChatSideBar from "../components/chat/ChatSideBar";
import ChatArea from "../components/chat/ChatArea";
import type { ChatSession, ChatUser } from "../services/chat.service";
import { useAuth } from "~/contexts/AuthContext";

export default function ChatPage() {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
    const [receiver, setReceiver] = useState<ChatUser | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const sidebarRefreshRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSelectChat = (chat: ChatSession, partner: ChatUser) => {
        setSelectedChat(chat);
        setReceiver(partner);
    };

    const handleBackToList = () => {
        setSelectedChat(null);
        setReceiver(null);
    };

    const handleChatCreated = (newChatId: string) => {
        if (selectedChat && receiver) {
            setSelectedChat({
                ...selectedChat,
                chatId: newChatId,
            });
        }
        sidebarRefreshRef.current?.();
    };

    if (!user || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-600">{t('chat.loading')}</div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div className={`chat-body ${selectedChat ? "chat-selected" : ""}`}>
                {(!isMobile || !selectedChat) && (
                    <ChatSideBar
                        onSelectChat={handleSelectChat}
                        selectedChatId={selectedChat?.chatId}
                        onRefreshRef={(fn) => {
                            sidebarRefreshRef.current = fn;
                        }}
                    />
                )}

                {selectedChat && receiver ? (
                    <ChatArea
                        chatId={selectedChat.chatId}
                        receiver={receiver}
                        onChatCreated={handleChatCreated}
                        onBack={isMobile ? handleBackToList : undefined}
                    />
                ) : !isMobile ? (
                    <div
                        className="chat-area-placeholder"
                        style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#888",
                        }}
                    >
                        {t('chat.placeholder.selectChat')}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

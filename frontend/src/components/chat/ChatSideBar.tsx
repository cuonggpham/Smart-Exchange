import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { chatService } from "../../services/chat.service";
import type { ChatSession, ChatUser } from "../../services/chat.service";

interface Props {
    onSelectChat: (chat: ChatSession, partner: ChatUser) => void;
    selectedChatId?: string;
    onRefreshRef?: (fn: () => void) => void;
}

export default function ChatSideBar({ onSelectChat, selectedChatId, onRefreshRef }: Props) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [users, setUsers] = useState<ChatUser[]>([]);

    const loadData = useCallback(async () => {
        try {
            const [myChats, allUsers] = await Promise.all([
                chatService.getMyChats(),
                chatService.getAllUsers(),
            ]);
            setChats(myChats);

            const chattedUserIds = new Set(
                myChats.flatMap((c) => [c.userOne.userId, c.userTwo.userId])
            );
            setUsers(
                allUsers.filter((u) => u.userId !== user?.id && !chattedUserIds.has(u.userId))
            );
        } catch (error) {
            console.error("Failed to load chats", error);
        }
    }, [user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        onRefreshRef?.(loadData);
    }, [onRefreshRef, loadData]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessageNotification = () => {
            loadData();
        };

        socket.on("new_message_notification", handleNewMessageNotification);

        return () => {
            socket.off("new_message_notification", handleNewMessageNotification);
        };
    }, [socket, loadData]);

    const getPartner = (chat: ChatSession): ChatUser => {
        return chat.userOne.userId === user?.id ? chat.userTwo : chat.userOne;
    };

    const handleUserClick = (partner: ChatUser) => {
        const existingChat = chats.find(
            (c) => c.userOne.userId === partner.userId || c.userTwo.userId === partner.userId
        );

        if (existingChat) {
            onSelectChat(existingChat, partner);
        } else {
            const tempChat: ChatSession = {
                chatId: "",
                userOne: { userId: user!.id, fullName: "", email: "" },
                userTwo: partner,
                messages: [],
                updateAt: new Date().toISOString(),
            };
            onSelectChat(tempChat, partner);
        }
    };

    return (
        <div className="chat-sidebar">
            <a href="/" className="back-link">
                ← {t('chat.sidebar.backHome')}
            </a>

            <div className="history-title">{t('chat.sidebar.recentChats')}</div>
            <div className="history-list">
                {chats.map((chat) => {
                    const partner = getPartner(chat);
                    return (
                        <div
                            key={chat.chatId}
                            className={`history-item ${
                                selectedChatId === chat.chatId ? "selected" : ""
                            }`}
                            onClick={() => onSelectChat(chat, partner)}
                        >
                            <div style={{ fontWeight: "bold" }}>{partner.fullName}</div>
                            <div style={{ fontSize: "12px", color: "#666" }}>
                                {chat.messages[0]?.content || t('chat.sidebar.noMessages')}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="history-title" style={{ marginTop: "20px" }}>
                {t('chat.sidebar.otherUsers')}
            </div>
            <div className="history-list">
                {users.map((u) => (
                    <div key={u.userId} className="history-item" onClick={() => handleUserClick(u)}>
                        {u.fullName}
                    </div>
                ))}
            </div>
        </div>
    );
}

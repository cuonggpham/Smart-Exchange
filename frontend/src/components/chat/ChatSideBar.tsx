import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { chatService } from "../../services/chat.service";
import type { ChatSession, ChatUser } from "../../services/chat.service";
import { User, Users } from "lucide-react";

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

    // Get initials for avatar placeholder
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="chat-sidebar">
            <div className="history-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} />
                {t('chat.sidebar.recentChats')}
            </div>
            <div className="history-list">
                {chats.length === 0 ? (
                    <div className="text-muted text-sm" style={{ padding: '12px 0' }}>
                        {t('chat.sidebar.noChats') || 'No conversations yet'}
                    </div>
                ) : (
                    chats.map((chat) => {
                        const partner = getPartner(chat);
                        const isSelected = selectedChatId === chat.chatId;
                        return (
                            <div
                                key={chat.chatId}
                                className={`history-item ${isSelected ? "selected" : ""}`}
                                onClick={() => onSelectChat(chat, partner)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onSelectChat(chat, partner)}
                            >
                                <div
                                    className="history-item-avatar"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: isSelected ? 'var(--primary-color)' : 'var(--bg-tertiary)',
                                        color: isSelected ? '#fff' : 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: 13,
                                        flexShrink: 0,
                                    }}
                                >
                                    {getInitials(partner.fullName || partner.email)}
                                </div>
                                <div className="history-item-info">
                                    <div className="history-item-name">{partner.fullName || partner.email}</div>
                                    <div className="history-item-preview">
                                        {chat.messages[0]?.content || t('chat.sidebar.noMessages')}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="history-title" style={{ marginTop: "24px", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={14} />
                {t('chat.sidebar.otherUsers')}
            </div>
            <div className="history-list">
                {users.length === 0 ? (
                    <div className="text-muted text-sm" style={{ padding: '12px 0' }}>
                        {t('chat.sidebar.noOtherUsers') || 'No other users available'}
                    </div>
                ) : (
                    users.map((u) => (
                        <div
                            key={u.userId}
                            className="history-item"
                            onClick={() => handleUserClick(u)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleUserClick(u)}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'var(--secondary-light)',
                                    color: 'var(--secondary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: 13,
                                    flexShrink: 0,
                                }}
                            >
                                {getInitials(u.fullName || u.email)}
                            </div>
                            <div className="history-item-info">
                                <div className="history-item-name">{u.fullName || u.email}</div>
                                <div className="history-item-preview">{u.email}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

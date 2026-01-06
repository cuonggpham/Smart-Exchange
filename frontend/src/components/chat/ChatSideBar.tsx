import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { chatService } from "../../services/chat.service";
import type { ChatSession, ChatUser } from "../../services/chat.service";
import { User, Users, Search } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import UserAvatar from "../UserAvatar";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const loadChats = useCallback(async () => {
        try {
            const myChats = await chatService.getMyChats();
            setChats(myChats);
        } catch (error) {
            console.error("Failed to load chats", error);
        }
    }, []);

    const loadUsers = useCallback(async (search?: string) => {
        try {
            setIsSearching(true);
            const [myChats, allUsers] = await Promise.all([
                chatService.getMyChats(),
                chatService.getAllUsers(search),
            ]);

            const chattedUserIds = new Set(
                myChats.flatMap((c) => [c.userOne.userId, c.userTwo.userId])
            );
            setUsers(
                allUsers.filter((u) => u.userId !== user?.id && !chattedUserIds.has(u.userId))
            );
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setIsSearching(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadChats();
        loadUsers();
    }, [loadChats, loadUsers]);

    useEffect(() => {
        onRefreshRef?.(() => {
            loadChats();
            loadUsers(debouncedSearchQuery);
        });
    }, [onRefreshRef, loadChats, loadUsers, debouncedSearchQuery]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessageNotification = () => {
            loadChats();
            loadUsers(debouncedSearchQuery);
        };

        socket.on("new_message_notification", handleNewMessageNotification);

        return () => {
            socket.off("new_message_notification", handleNewMessageNotification);
        };
    }, [socket, loadChats, loadUsers, debouncedSearchQuery]);

    // Debounced search effect
    useEffect(() => {
        loadUsers(debouncedSearchQuery);
    }, [debouncedSearchQuery, loadUsers]);

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
                                <div className="history-item-avatar">
                                    <UserAvatar
                                        src={partner.avatar}
                                        name={partner.fullName || partner.email}
                                        size={36}
                                        style={{ fontSize: 13 }}
                                    />
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

            {/* Search Input */}
            <div style={{
                padding: '8px 0',
                marginBottom: '8px'
            }}>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Search
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            color: 'var(--text-muted)',
                            pointerEvents: 'none'
                        }}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('chat.sidebar.searchPlaceholder')}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--primary-color)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-color)';
                        }}
                    />
                </div>
            </div>

            <div className="history-list">
                {isSearching ? (
                    <div className="text-muted text-sm" style={{ padding: '12px 0', textAlign: 'center' }}>
                        Đang tìm kiếm...
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-muted text-sm" style={{ padding: '12px 0' }}>
                        {searchQuery
                            ? `Không tìm thấy người dùng "${searchQuery}"`
                            : t('chat.sidebar.noOtherUsers') || 'No other users available'
                        }
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
                            <div className="history-item-avatar">
                                <UserAvatar
                                    src={u.avatar}
                                    name={u.fullName || u.email}
                                    size={36}
                                    style={{ fontSize: 13 }}
                                />
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

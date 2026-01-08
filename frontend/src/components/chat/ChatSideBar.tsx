import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { chatService } from "../../services/chat.service";
import type { ChatSession, ChatUser } from "../../services/chat.service";
import { MessageCircle, Users, Search, Edit } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import UserAvatar from "../UserAvatar";

interface Props {
    onSelectChat: (chat: ChatSession, partner: ChatUser) => void;
    selectedChatId?: string;
    onRefreshRef?: (fn: () => void) => void;
}

export default function ChatSideBar({ onSelectChat, selectedChatId, onRefreshRef }: Props) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Helper function to format time with i18n
    const formatMessageTime = useCallback((dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t('chat.sidebar.time.justNow');
        if (diffMins < 60) return t('chat.sidebar.time.minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('chat.sidebar.time.hoursAgo', { count: diffHours });
        if (diffDays < 7) return t('chat.sidebar.time.daysAgo', { count: diffDays });

        const locale = i18n.language === 'jp' ? 'ja-JP' : 'vi-VN';
        return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
    }, [t, i18n.language]);

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

    // Filter chats based on search query
    const filteredChats = chats.filter((chat) => {
        if (!searchQuery.trim()) return true;
        const partner = getPartner(chat);
        const query = searchQuery.toLowerCase();
        return (
            partner.fullName?.toLowerCase().includes(query) ||
            partner.email?.toLowerCase().includes(query)
        );
    });

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
        <div className="chat-sidebar messenger-style">
            {/* Header */}
            <div className="sidebar-header">
                <h2 className="sidebar-title">{t('chat.sidebar.title')}</h2>
                <div className="sidebar-actions">
                    <button className="sidebar-action-btn" title={t('chat.sidebar.newMessage')}>
                        <Edit size={18} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="messenger-search-container">
                <Search size={16} className="messenger-search-icon" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('chat.sidebar.searchPlaceholder')}
                />
            </div>

            {/* Recent Chats Section */}
            <div className="messenger-section-title">
                <MessageCircle size={14} />
                {t('chat.sidebar.recentChats')}
            </div>

            <div className="messenger-conversation-list">
                {filteredChats.length === 0 ? (
                    <div className="messenger-empty-state">
                        {searchQuery
                            ? t('chat.sidebar.noChatsFound')
                            : t('chat.sidebar.noChats')}
                    </div>
                ) : (
                    filteredChats.map((chat) => {
                        const partner = getPartner(chat);
                        const isSelected = selectedChatId === chat.chatId;
                        const lastMessage = chat.messages[0]?.content || t('chat.sidebar.noMessages');
                        const lastTime = chat.updateAt ? formatMessageTime(chat.updateAt) : "";

                        return (
                            <div
                                key={chat.chatId}
                                className={`messenger-conversation-item ${isSelected ? "selected" : ""}`}
                                onClick={() => onSelectChat(chat, partner)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onSelectChat(chat, partner)}
                            >
                                <div className="messenger-avatar-wrapper">
                                    <UserAvatar
                                        src={partner.avatar}
                                        name={partner.fullName || partner.email}
                                        size={52}
                                        style={{ fontSize: 18 }}
                                    />
                                </div>
                                <div className="messenger-conversation-content">
                                    <div className="messenger-conversation-header">
                                        <span className="messenger-conversation-name">
                                            {partner.fullName || partner.email}
                                        </span>
                                        <span className="messenger-conversation-time">
                                            {lastTime}
                                        </span>
                                    </div>
                                    <div className="messenger-conversation-preview">
                                        {lastMessage}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Other Users Section */}
            <div className="messenger-section-title" style={{ marginTop: "16px" }}>
                <Users size={14} />
                {t('chat.sidebar.otherUsers')}
            </div>

            <div className="messenger-conversation-list">
                {isSearching ? (
                    <div className="messenger-loading">
                        {t('chat.sidebar.searching')}
                    </div>
                ) : users.length === 0 ? (
                    <div className="messenger-empty-state">
                        {searchQuery
                            ? t('chat.sidebar.noUsersFound')
                            : t('chat.sidebar.noOtherUsers')
                        }
                    </div>
                ) : (
                    users.map((u) => (
                        <div
                            key={u.userId}
                            className="messenger-conversation-item"
                            onClick={() => handleUserClick(u)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleUserClick(u)}
                        >
                            <div className="messenger-avatar-wrapper">
                                <UserAvatar
                                    src={u.avatar}
                                    name={u.fullName || u.email}
                                    size={52}
                                    style={{ fontSize: 18 }}
                                />
                            </div>
                            <div className="messenger-conversation-content">
                                <div className="messenger-conversation-header">
                                    <span className="messenger-conversation-name">
                                        {u.fullName || u.email}
                                    </span>
                                </div>
                                <div className="messenger-conversation-preview">
                                    {u.email}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}


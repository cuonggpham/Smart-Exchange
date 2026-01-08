import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Info } from "lucide-react";
import UserAvatar from "../UserAvatar";
import MsgList from "./MsgList";
import MessageInput from "./MessageInput";
import type { MessageInputRef } from "./MessageInput";
import AICultureCheckModal from "./AICultureCheckModal";
import ChatSettingsSidebar from "./ChatSettingsSidebar";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { chatService } from "../../services/chat.service";
import { aiService } from "../../services/ai.service";
import { historyService } from "../../services/history.service";
import { contextService } from "../../services/context.service";
import type { ChatUser } from "../../services/chat.service";
import type { AICheckResponse, ConversationSummary, AISuggestion, ContextMessage } from "../../types/ai.types";
import "../../styles/ChatPage.css";

export interface DisplayMessage {
    id: string;
    sender: "user" | "other";
    senderName?: string;
    avatar?: string;
    text: string | null;
    timestamp: string;
    createdAt: Date;
    aiAnalysis?: {
        translatedText: string;
        intentSummary: string;
        culturalNote: string;
        isIndirectExpression: boolean;
    };
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
}

interface Props {
    chatId: string;
    receiver: ChatUser;
    onChatCreated?: (newChatId: string) => void;
    onBack?: () => void;
}

export default function ChatArea({ chatId, receiver, onChatCreated, onBack }: Props) {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const listRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<MessageInputRef>(null);
    const currentChatIdRef = useRef(chatId);
    const displayedMessageIds = useRef<Set<string>>(new Set());
    const shouldScrollToBottom = useRef(false);

    // AI Check states
    const [isAILoading, setIsAILoading] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiResponse, setAIResponse] = useState<AICheckResponse | null>(null);
    const [pendingText, setPendingText] = useState("");

    // Conversation summary state - persists across AI checks
    const [conversationSummary, setConversationSummary] = useState<ConversationSummary | null>(null);

    // Settings sidebar states
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [cultureCheckEnabled, setCultureCheckEnabled] = useState(true);


    useEffect(() => {
        if (!chatId && receiver.userId) {
            chatService.initChat(receiver.userId)
                .then((chat) => {
                    if (onChatCreated) {
                        onChatCreated(chat.chatId);
                    }
                })
                .catch((err) => console.error("Failed to init chat:", err));
        }

        currentChatIdRef.current = chatId;
        // Reset conversation summary when changing chats
        setConversationSummary(null);
    }, [chatId, receiver.userId, onChatCreated]);

    useEffect(() => {
        displayedMessageIds.current.clear();
    }, [chatId, receiver.userId]);

    useEffect(() => {
        if (socket && chatId) {
            socket.emit("join_chat", { chatId });
        }
    }, [socket, chatId]);

    useEffect(() => {
        if (chatId) {
            chatService.getMessages(chatId).then((data) => {
                const formatted = data
                    .map<DisplayMessage>((m) => {
                        let aiAnalysis = undefined;
                        if (m.aiAnalysisContent) {
                            try {
                                aiAnalysis = JSON.parse(m.aiAnalysisContent);
                            } catch (e) {
                                console.error("Failed to parse AI analysis:", e);
                            }
                        }
                        return {
                            id: m.messageId,
                            sender: m.senderId === user?.id ? "user" : "other",
                            senderName: m.senderId === user?.id ? (user?.fullName || user?.email) : (receiver.fullName || receiver.email),
                            avatar: m.senderId === user?.id ? user?.avatar : receiver.avatar,
                            text: m.content,
                            timestamp: new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                            createdAt: new Date(m.createdAt),
                            aiAnalysis,
                            attachmentUrl: m.attachmentUrl,
                            attachmentName: m.attachmentName,
                            attachmentType: m.attachmentType,
                        };
                    })
                    .reverse();
                formatted.forEach((m) => displayedMessageIds.current.add(m.id));
                setMessages(formatted);
            });
        } else {
            setMessages([]);
        }
    }, [chatId, user?.id]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMsg: any) => {
            if (displayedMessageIds.current.has(newMsg.messageId)) {
                return;
            }

            const isCurrentChat =
                newMsg.chatId === currentChatIdRef.current ||
                (newMsg.senderId === receiver.userId && !currentChatIdRef.current) ||
                (newMsg.receiverId === receiver.userId && !currentChatIdRef.current) ||
                newMsg.senderId === receiver.userId;

            if (isCurrentChat) {
                displayedMessageIds.current.add(newMsg.messageId);

                const formattedMsg: DisplayMessage = {
                    id: newMsg.messageId,
                    sender: newMsg.senderId === user?.id ? "user" : "other",
                    senderName: newMsg.senderId === user?.id ? (user?.fullName || user?.email) : (receiver.fullName || receiver.email),
                    avatar: newMsg.senderId === user?.id ? user?.avatar : receiver.avatar,
                    text: newMsg.content,
                    attachmentUrl: newMsg.attachmentUrl,
                    attachmentName: newMsg.attachmentName,
                    attachmentType: newMsg.attachmentType,
                    timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    createdAt: new Date(newMsg.createdAt),
                };
                setMessages((prev) => [...prev, formattedMsg]);
                shouldScrollToBottom.current = true;

                if (!currentChatIdRef.current && newMsg.chatId) {
                    currentChatIdRef.current = newMsg.chatId;
                    onChatCreated?.(newMsg.chatId);
                    socket.emit("join_chat", { chatId: newMsg.chatId });
                }
            }
        };

        const handleMessageDeleted = (data: { messageId: string; chatId: string }) => {
            if (data.chatId === currentChatIdRef.current) {
                setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
                displayedMessageIds.current.delete(data.messageId);
            }
        };

        socket.on("message_received", handleNewMessage);
        socket.on("new_message_notification", handleNewMessage);
        socket.on("message_deleted", handleMessageDeleted);

        return () => {
            socket.off("message_received", handleNewMessage);
            socket.off("new_message_notification", handleNewMessage);
            socket.off("message_deleted", handleMessageDeleted);
        };
    }, [socket, user?.id, receiver.userId, onChatCreated]);

    useEffect(() => {
        if (listRef.current && shouldScrollToBottom.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
            shouldScrollToBottom.current = false;
        }
    }, [messages]);

    const handleSend = (text: string, attachment?: { url: string; name: string; type: string }) => {
        if (!socket || !user) return;

        socket.emit("send_message", {
            chatId: chatId || undefined,
            receiverId: receiver.userId,
            content: text || undefined,
            attachment,
        });

        // Clear input after sending
        messageInputRef.current?.clearInput();
        messageInputRef.current?.focusInput();
    };

    const handleAICheck = async (text: string) => {
        setPendingText(text);
        setIsAILoading(true);

        try {
            // Build context from recent messages
            const context: ContextMessage[] = messages.slice(-10).map((msg): ContextMessage => ({
                sender: msg.sender,
                text: (msg.text || (msg.attachmentUrl ? `(${msg.attachmentName || "Tệp đính kèm"})` : "")) as string,
            }));

            // Pass existing summary and user-defined context for better analysis
            // Note: contextDescription is now fetched from DB by backend using chatId/userId
            const response = await aiService.checkCulture(
                text,
                context,
                conversationSummary?.summary,
                chatId || undefined,
                undefined  // Removed payload contextDescription as requested
            );

            setAIResponse(response);
            setIsAIModalOpen(true);

            // Update conversation summary if returned
            if (response.conversationSummary) {
                setConversationSummary(response.conversationSummary);
            }
        } catch (error) {
            console.error("AI check failed:", error);
            handleSend(text);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleSendOriginal = () => {
        handleSend(pendingText);
        closeAIModal();
    };

    const handleSendSuggestion = async (suggestion: AISuggestion) => {
        handleSend(suggestion.text);

        // Save to history asynchronously
        if (chatId) {
            try {
                const context = await contextService.getContext(chatId);
                await historyService.createHistory({
                    receiverName: receiver.fullName,
                    chatId,
                    contextDescription: context.contextDescription,
                    originalText: pendingText,
                    selectedSuggestion: suggestion.text,
                    suggestionLevel: suggestion.level,
                    culturalNotes: aiResponse?.culturalNotes
                });
            } catch (error) {
                console.error("Failed to save suggestion history:", error);
            }
        }

        closeAIModal();
    };

    const handleContinueEditing = () => {
        closeAIModal();
        messageInputRef.current?.focusInput();
    };

    const closeAIModal = () => {
        setIsAIModalOpen(false);
        setAIResponse(null);
        setPendingText("");
    };

    const handleDeleteMessage = (messageId: string) => {
        if (!socket) return;
        socket.emit("delete_message", { messageId });
    };

    return (
        <div className={`chat-area-wrapper ${isSettingsOpen ? "with-sidebar" : ""}`}>
            {/* Main Chat Area */}
            <div className="chat-main-content">
                {/* Messenger-style Chat Header */}
                <div className="messenger-header">
                    <div className="messenger-header-left">
                        {onBack && (
                            <button
                                className="messenger-back-btn"
                                onClick={onBack}
                                title="Back"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div className="messenger-user-info">
                            <UserAvatar
                                src={receiver.avatar}
                                name={receiver.fullName}
                                size={40}
                                className="messenger-avatar"
                            />
                            <span className="messenger-user-name">{receiver.fullName}</span>
                        </div>
                    </div>
                    <div className="messenger-header-actions">
                        <button
                            className={`messenger-action-btn ${isSettingsOpen ? "active" : ""}`}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            title="Conversation info"
                        >
                            <Info size={20} />
                        </button>
                    </div>
                </div>
                <div className="chat-area" ref={listRef}>
                    <MsgList
                        messages={messages}
                        onDeleteMessage={handleDeleteMessage}
                    />
                </div>
                <MessageInput
                    ref={messageInputRef}
                    onSend={handleSend}
                    onAICheck={handleAICheck}
                    cultureCheckEnabled={cultureCheckEnabled}
                    onCultureCheckChange={setCultureCheckEnabled}
                />
            </div>

            {/* Settings Sidebar */}
            <ChatSettingsSidebar
                chatId={chatId}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                cultureCheckEnabled={cultureCheckEnabled}
                onCultureCheckChange={setCultureCheckEnabled}
                receiver={receiver}
            />

            {/* AI Culture Check Modal */}
            <AICultureCheckModal
                isOpen={isAIModalOpen}
                isLoading={isAILoading}
                response={aiResponse}
                onClose={closeAIModal}
                onSendOriginal={handleSendOriginal}
                onSendSuggestion={handleSendSuggestion}
                onContinueEditing={handleContinueEditing}
            />
        </div>
    );
}

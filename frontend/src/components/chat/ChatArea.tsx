import { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import MsgList from "./MsgList";
import MessageInput from "./MessageInput";
import type { MessageInputRef } from "./MessageInput";
import AICultureCheckModal from "./AICultureCheckModal";
import ChatSettingsSidebar from "./ChatSettingsSidebar";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { chatService } from "../../services/chat.service";
import { aiService } from "../../services/ai.service";
import type { ChatUser } from "../../services/chat.service";
import type { AICheckResponse, ConversationSummary } from "../../types/ai.types";
import "../../styles/ChatPage.css";

export interface DisplayMessage {
    id: string;
    sender: "user" | "other";
    text: string;
    timestamp: string;
    aiAnalysis?: {
        translatedText: string;
        intentSummary: string;
        culturalNote: string;
        isIndirectExpression: boolean;
    };
}

interface Props {
    chatId: string;
    receiver: ChatUser;
    onChatCreated?: (newChatId: string) => void;
}

export default function ChatArea({ chatId, receiver, onChatCreated }: Props) {
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
                            text: m.content,
                            timestamp: new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                            aiAnalysis,
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
                    text: newMsg.content,
                    timestamp: new Date(newMsg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
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

    const handleSend = (text: string) => {
        if (!socket || !user) return;

        socket.emit("send_message", {
            chatId: chatId || undefined,
            receiverId: receiver.userId,
            content: text,
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
            const context = messages.slice(-10).map((msg) => ({
                sender: msg.sender,
                text: msg.text,
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

    const handleSendSuggestion = (text: string) => {
        handleSend(text);
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
        <div className="chat-area-wrapper" style={{ position: "relative" }}>
            <div
                className="chat-header-info"
                style={{ padding: "10px 20px", borderBottom: "1px solid #eee", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
                <span>{receiver.fullName}</span>
                <button
                    className="settings-btn"
                    onClick={() => setIsSettingsOpen(true)}
                    title="Settings"
                >
                    <Settings size={20} />
                </button>
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
            />

            {/* Settings Sidebar */}
            <ChatSettingsSidebar
                chatId={chatId}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                cultureCheckEnabled={cultureCheckEnabled}
                onCultureCheckChange={setCultureCheckEnabled}
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

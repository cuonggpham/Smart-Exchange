import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { Languages, AlertTriangle, Lightbulb, ChevronDown, X, Sparkles, Loader2, File, Download } from "lucide-react";
import type { DisplayMessage as Message } from "./ChatArea";
import { chatService } from "../../services/chat.service";
import UserAvatar from "../UserAvatar";
import "./MessageBubble.css";

interface Props {
    msg: Message;
    onDelete?: (messageId: string) => void;
}

export default function MessageBubble({ msg, onDelete }: Props) {
    const { t } = useTranslation();
    const [showActions, setShowActions] = useState(false);
    const [showTimestamp, setShowTimestamp] = useState(false);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isNoteExpanded, setIsNoteExpanded] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [localAnalysis, setLocalAnalysis] = useState(msg.aiAnalysis);
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(true);

    const isUser = msg.sender === "user";
    const aiAnalysis = localAnalysis;

    const hasJapanese = msg.text ? /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(msg.text) : false;

    const handleAnalyze = async () => {
        if (isAnalyzing || aiAnalysis) return;
        setIsAnalyzing(true);
        try {
            const displayLanguage = i18n.language === "vi" ? "vi" : "jp";
            const result = await chatService.analyzeMessage(msg.id, displayLanguage);
            if (result) {
                setLocalAnalysis(result);
            }
        } catch (error) {
            console.error("Failed to analyze message:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderAttachment = () => {
        if (!msg.attachmentUrl) return null;

        const type = msg.attachmentType || "";
        const url = msg.attachmentUrl;
        const name = msg.attachmentName || "file";

        if (type.startsWith("image/")) {
            return (
                <div className="message-attachment">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={name} className="message-image" />
                    </a>
                </div>
            );
        }

        if (type.startsWith("video/")) {
            return (
                <div className="message-attachment">
                    <video src={url} controls className="message-video" />
                </div>
            );
        }

        return (
            <div className="message-attachment">
                <a href={url} target="_blank" rel="noopener noreferrer" className="file-attachment">
                    <File size={24} />
                    <div className="file-info">
                        <span className="file-name-bubble">{name}</span>
                        <span className="file-download-text">{t("chat.attachment.download") || "Click to download"}</span>
                    </div>
                    <Download size={18} />
                </a>
            </div>
        );
    };

    const handleMouseEnter = () => {
        // Clear any pending hide timeout
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        setShowActions(true);

        // Delay showing timestamp by 1 second
        showTimeoutRef.current = setTimeout(() => {
            setShowTimestamp(true);
        }, 500);
    };

    const handleMouseLeave = () => {
        // Clear any pending show timeout
        if (showTimeoutRef.current) {
            clearTimeout(showTimeoutRef.current);
            showTimeoutRef.current = null;
        }
        setShowActions(false);

        // Delay hiding timestamp for smooth UX
        hideTimeoutRef.current = setTimeout(() => {
            setShowTimestamp(false);
        }, 300);
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            className={`bubble-row ${isUser ? "right" : "left"}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <UserAvatar
                src={msg.avatar}
                name={msg.senderName}
                size={36}
                className="avatar"
            />
            <div className="bubble-wrapper">
                <div className="bubble">
                    {renderAttachment()}
                    <div className="message-text">{msg.text}</div>
                    {isUser && showActions && onDelete && (
                        <button
                            className="delete-msg-btn"
                            onClick={() => onDelete(msg.id)}
                            title={t("common.delete")}
                        >
                            <X size={12} />
                        </button>
                    )}
                    {!isUser && !aiAnalysis && hasJapanese && (
                        <button
                            className={`analyze-msg-btn ${isAnalyzing ? "loading" : ""}`}
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            title={t("chat.aiNote.analyze")}
                        >
                            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        </button>
                    )}
                    {!isUser && aiAnalysis && (
                        <button
                            className={`analyze-msg-btn toggle-eye ${isAnalysisVisible ? 'visible' : 'hidden'}`}
                            onClick={() => setIsAnalysisVisible(!isAnalysisVisible)}
                            title={isAnalysisVisible ? t("common.hide") : t("common.show")}
                        >
                            <Sparkles size={14} />
                        </button>
                    )}
                </div>

                {/* AI Analysis for received messages */}
                {!isUser && aiAnalysis && isAnalysisVisible && (
                    <div className="ai-analysis-section">
                        {/* Inline translation */}
                        <div className="ai-translation">
                            <Languages size={14} className="translation-icon" />
                            <span className="translation-text">{aiAnalysis.translatedText}</span>
                        </div>

                        {/* Warning indicator for indirect expressions */}
                        {aiAnalysis.isIndirectExpression && (
                            <div className="indirect-warning">
                                <AlertTriangle size={12} />
                                {t("chat.aiNote.indirectWarning")}
                            </div>
                        )}

                        {/* Expandable AI note */}
                        {(aiAnalysis.intentSummary || aiAnalysis.culturalNote) && (
                            <div className="ai-note-toggle" onClick={() => setIsNoteExpanded(!isNoteExpanded)}>
                                <Lightbulb size={14} className="note-icon" />
                                <span className="note-label">
                                    {isNoteExpanded ? t("chat.aiNote.collapse") : t("chat.aiNote.viewDetails")}
                                </span>
                                <ChevronDown size={12} className={`expand-arrow ${isNoteExpanded ? "expanded" : ""}`} />
                            </div>
                        )}

                        {isNoteExpanded && (
                            <div className="ai-note-content">
                                {aiAnalysis.intentSummary && (
                                    <div className="note-section">
                                        <strong>{t("chat.aiNote.realIntent")}:</strong> {aiAnalysis.intentSummary}
                                    </div>
                                )}
                                {aiAnalysis.culturalNote && (
                                    <div className="note-section">
                                        <strong>{t("chat.aiNote.culturalContext")}:</strong> {aiAnalysis.culturalNote}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className={`timestamp messenger-style ${showTimestamp ? 'visible' : ''}`}>
                    {msg.timestamp}
                </div>
            </div>
        </div>
    );
}

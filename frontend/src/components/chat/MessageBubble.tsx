import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Languages, AlertTriangle, Lightbulb, ChevronDown, X, Sparkles, Loader2 } from "lucide-react";
import type { DisplayMessage as Message } from "./ChatArea";
import { chatService } from "../../services/chat.service";
import avatarUser from "../../assets/avatar-user.png";
import avatarOther from "../../assets/avatar-other.png";
import "./MessageBubble.css";

interface Props {
    msg: Message;
    onDelete?: (messageId: string) => void;
}

export default function MessageBubble({ msg, onDelete }: Props) {
    const { t } = useTranslation();
    const [showActions, setShowActions] = useState(false);
    const [isNoteExpanded, setIsNoteExpanded] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [localAnalysis, setLocalAnalysis] = useState(msg.aiAnalysis);

    const isUser = msg.sender === "user";
    const aiAnalysis = localAnalysis;

    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(msg.text);

    const handleAnalyze = async () => {
        if (isAnalyzing || aiAnalysis) return;
        setIsAnalyzing(true);
        try {
            const result = await chatService.analyzeMessage(msg.id);
            if (result) {
                setLocalAnalysis(result);
            }
        } catch (error) {
            console.error("Failed to analyze message:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div
            className={`bubble-row ${isUser ? "right" : "left"}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <img src={isUser ? avatarUser : avatarOther} className="avatar" alt="avatar" />
            <div className="bubble-wrapper">
                <div className="bubble">
                    {msg.text}
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
                </div>

                {/* AI Analysis for received messages */}
                {!isUser && aiAnalysis && (
                    <div className="ai-analysis-section">
                        {/* Inline translation with inferred subjects */}
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

                        {/* Expandable AI note (collapsed by default) */}
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

                <div className="timestamp">{msg.timestamp}</div>
            </div>
        </div>
    );
}

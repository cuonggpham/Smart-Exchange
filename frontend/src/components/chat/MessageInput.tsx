import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, X, FileText, Send, Sparkles } from "lucide-react";
import { chatService } from "../../services/chat.service";

interface Props {
    onSend: (text: string, attachment?: { url: string; name: string; type: string }) => void;
    onAICheck?: (text: string) => void;
    cultureCheckEnabled?: boolean;
    onCultureCheckChange?: (enabled: boolean) => void;
}

export interface MessageInputRef {
    getInputText: () => string;
    clearInput: () => void;
    focusInput: () => void;
}

const MessageInput = forwardRef<MessageInputRef, Props>(({ onSend, onAICheck, cultureCheckEnabled = true, onCultureCheckChange }, ref) => {
    const { t } = useTranslation();
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [localCultureCheck, setLocalCultureCheck] = useState(cultureCheckEnabled);

    // Sync with external prop
    useEffect(() => {
        setLocalCultureCheck(cultureCheckEnabled);
    }, [cultureCheckEnabled]);

    const handleToggleCultureCheck = () => {
        const newValue = !localCultureCheck;
        setLocalCultureCheck(newValue);
        onCultureCheckChange?.(newValue);
    };

    useImperativeHandle(ref, () => ({
        getInputText: () => editorRef.current?.innerText.trim() || "",
        clearInput: () => {
            if (editorRef.current) {
                editorRef.current.innerHTML = "";
            }
            setAttachment(null);
        },
        focusInput: () => {
            editorRef.current?.focus();
        },
    }));

    useEffect(() => {
        editorRef.current?.focus();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploaded = await chatService.uploadFile(file);
            setAttachment(uploaded);
        } catch (error) {
            console.error("Upload failed:", error);
            alert(t("chat.upload.failed") || "Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Handle submit with optional force mode
    const handleSubmit = (forceMode?: 'direct' | 'ai') => {
        const div = editorRef.current;
        if (!div) return;

        const text = div.innerText.trim();
        if (!text && !attachment) return;

        // Determine if we should use AI check
        const shouldUseAI = forceMode === 'ai' ||
            (forceMode !== 'direct' && localCultureCheck && onAICheck && text && !attachment);

        if (shouldUseAI && onAICheck && text) {
            onAICheck(text);
        } else {
            // Send directly
            onSend(text, attachment || undefined);
            div.innerHTML = "";
            setAttachment(null);
            div.focus();
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            if (e.shiftKey) {
                // Shift+Enter: New line (let default behavior happen)
                return;
            } else if (e.altKey) {
                // Alt+Enter: Always use AI analysis
                e.preventDefault();
                handleSubmit('ai');
            } else if (e.ctrlKey || e.metaKey) {
                // Ctrl+Enter (or Cmd+Enter on Mac): Always send directly
                e.preventDefault();
                handleSubmit('direct');
            } else {
                // Enter alone: Follow toggle state
                e.preventDefault();
                handleSubmit();
            }
        }
    };

    return (
        <div className="input-container-wrapper">
            {attachment && (
                <div className="attachment-preview">
                    {attachment.type.startsWith("image/") ? (
                        <img src={attachment.url} alt="preview" className="preview-image" />
                    ) : (
                        <div className="preview-file">
                            <FileText size={20} />
                            <span className="file-name">{attachment.name}</span>
                        </div>
                    )}
                    <button className="remove-attach" onClick={() => setAttachment(null)}>
                        <X size={14} />
                    </button>
                </div>
            )}
            <div className="input-container">
                <button
                    className="attach-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    type="button"
                >
                    <Paperclip size={20} className={isUploading ? "animate-pulse" : ""} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                <div
                    ref={editorRef}
                    className="editor input-placeholder"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onKeyDown={onKeyDown}
                />

                {/* AI Check Toggle - Simple Icon Button */}
                <button
                    className={`ai-toggle-btn ${localCultureCheck ? 'on' : 'off'}`}
                    onClick={handleToggleCultureCheck}
                    type="button"
                    title={localCultureCheck ? t('chat.input.aiCheckOn') : t('chat.input.aiCheckOff')}
                    aria-label={t('chat.input.toggleAICheck')}
                >
                    <span className={`ai-toggle-icon-wrapper ${!localCultureCheck ? 'slashed' : ''}`}>
                        <Sparkles size={18} />
                    </span>
                </button>

                <button className="send-button" onClick={() => handleSubmit()} disabled={isUploading}>
                    <Send size={18} />
                    {t('chat.input.sendButton')}
                </button>
            </div>
        </div>
    );
});

MessageInput.displayName = "MessageInput";

export default MessageInput;

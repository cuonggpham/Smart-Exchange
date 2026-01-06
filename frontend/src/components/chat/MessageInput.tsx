import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, X, FileText } from "lucide-react";
import { chatService } from "../../services/chat.service";

interface Props {
    onSend: (text: string, attachment?: { url: string; name: string; type: string }) => void;
    onAICheck?: (text: string) => void;
    cultureCheckEnabled?: boolean;
}

export interface MessageInputRef {
    getInputText: () => string;
    clearInput: () => void;
    focusInput: () => void;
}

const MessageInput = forwardRef<MessageInputRef, Props>(({ onSend, onAICheck, cultureCheckEnabled = true }, ref) => {
    const { t } = useTranslation();
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);

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

    const handleSubmit = () => {
        const div = editorRef.current;
        if (!div) return;

        const text = div.innerText.trim();
        if (!text && !attachment) return;

        // If culture check is enabled and onAICheck is provided, and it's a text-only message
        // For simplicity, we only trigger AI check if there's text and no attachment, 
        // or we can decide how to handle it. Usually AI check is for text content.
        if (cultureCheckEnabled && onAICheck && text && !attachment) {
            onAICheck(text);
        } else {
            // Otherwise, send directly
            onSend(text, attachment || undefined);
            div.innerHTML = "";
            setAttachment(null);
            div.focus();
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
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

                <button className="send-button" onClick={handleSubmit} disabled={isUploading}>
                    {cultureCheckEnabled && !attachment ? t('chat.input.checkButton') : t('chat.input.sendButton')}
                </button>
            </div>
        </div>
    );
});

MessageInput.displayName = "MessageInput";

export default MessageInput;

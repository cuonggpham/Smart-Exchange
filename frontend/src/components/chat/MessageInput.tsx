import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    onSend: (text: string) => void;
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

    useImperativeHandle(ref, () => ({
        getInputText: () => editorRef.current?.innerText.trim() || "",
        clearInput: () => {
            if (editorRef.current) {
                editorRef.current.innerHTML = "";
            }
        },
        focusInput: () => {
            editorRef.current?.focus();
        },
    }));

    useEffect(() => {
        editorRef.current?.focus();
    }, []);

    const handleSubmit = () => {
        const div = editorRef.current;
        if (!div) return;

        const text = div.innerText.trim();
        if (!text) return;

        // If culture check is enabled and onAICheck is provided, use AI check
        if (cultureCheckEnabled && onAICheck) {
            onAICheck(text);
        } else {
            // Otherwise, send directly
            onSend(text);
            div.innerHTML = "";
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
        <div className="input-container">
            <div
                ref={editorRef}
                className="editor input-placeholder"
                contentEditable
                suppressContentEditableWarning={true}
                onKeyDown={onKeyDown}
            />

            <button className="send-button" onClick={handleSubmit}>
                {cultureCheckEnabled ? t('chat.input.checkButton') : t('chat.input.sendButton')}
            </button>
        </div>
    );
});

MessageInput.displayName = "MessageInput";

export default MessageInput;

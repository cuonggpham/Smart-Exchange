import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    onSend: (text: string) => void;
    onAICheck?: (text: string) => void;
}

export interface MessageInputRef {
    getInputText: () => string;
    clearInput: () => void;
    focusInput: () => void;
}

const MessageInput = forwardRef<MessageInputRef, Props>(({ onSend, onAICheck }, ref) => {
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

    const handleAICheck = () => {
        const div = editorRef.current;
        if (!div) return;

        const text = div.innerText.trim();
        if (!text) return;

        if (onAICheck) {
            onAICheck(text);
        } else {
            onSend(text);
            div.innerHTML = "";
            div.focus();
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAICheck();
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

            <button className="send-button" onClick={handleAICheck}>
                {t('chat.input.checkButton')}
            </button>
        </div>
    );
});

MessageInput.displayName = "MessageInput";

export default MessageInput;

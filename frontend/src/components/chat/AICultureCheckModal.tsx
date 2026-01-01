import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AICheckResponse, AISuggestion } from "../../types/ai.types";
import "../../styles/AICultureCheckModal.css";

interface Props {
    isOpen: boolean;
    isLoading: boolean;
    response: AICheckResponse | null;
    onClose: () => void;
    onSendOriginal: () => void;
    onSendSuggestion: (text: string) => void;
    onContinueEditing: () => void;
}

export default function AICultureCheckModal({
    isOpen,
    isLoading,
    response,
    onClose,
    onSendOriginal,
    onSendSuggestion,
    onContinueEditing,
}: Props) {
    const { t } = useTranslation();
    const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);

    if (isLoading) {
        return (
            <div className="ai-loading-overlay">
                <div className="ai-loading-content">
                    <div className="ai-loading-spinner"></div>
                    <div className="ai-loading-text">{t('chat.ai.checking')}</div>
                </div>
            </div>
        );
    }

    if (!isOpen || !response) {
        return null;
    }

    const handleSuggestionClick = (suggestion: AISuggestion) => {
        setSelectedSuggestion(suggestion);
    };

    const handleSendSelected = () => {
        if (selectedSuggestion) {
            onSendSuggestion(selectedSuggestion.text);
            setSelectedSuggestion(null);
        }
    };

    const handleClose = () => {
        setSelectedSuggestion(null);
        onClose();
    };

    const handleContinueEditing = () => {
        setSelectedSuggestion(null);
        onContinueEditing();
    };

    return (
        <div className="ai-modal-overlay" onClick={handleClose}>
            <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="ai-modal-header">
                    <div className="ai-modal-title">
                        <span className="icon">💡</span>
                        <span>{t('chat.ai.modalTitle')}</span>
                    </div>
                    <button className="ai-modal-close" onClick={handleClose}>
                        ×
                    </button>
                </div>

                <div className="ai-modal-body">
                    <div className="ai-original-text-box">
                        <span className="label">{t('chat.ai.originalText')}:</span>
                        <div className="text">「{response.originalText}」</div>
                    </div>

                    {response.culturalNotes && (
                        <div className="ai-cultural-notes-box">
                            <div className="label">
                                <span>⚠</span>
                                <span>{t('chat.ai.culturalNotes')}</span>
                            </div>
                            <div className="text">{response.culturalNotes}</div>
                        </div>
                    )}

                    {response.suggestions && response.suggestions.length > 0 && (
                        <div className="ai-suggestions-section">
                            <div className="ai-suggestions-title">{t('chat.ai.suggestions')}:</div>
                            {response.suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className={`ai-suggestion-card ${
                                        selectedSuggestion?.id === suggestion.id ? "selected" : ""
                                    }`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    <div className="ai-suggestion-header">
                                        <span className={`ai-suggestion-level ${suggestion.level}`}>
                                            {suggestion.levelLabel}
                                        </span>
                                    </div>
                                    <div className="ai-suggestion-text">{suggestion.text}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="ai-modal-footer">
                    <button className="ai-btn ai-btn-secondary" onClick={onSendOriginal}>
                        {t('chat.ai.sendOriginal')}
                    </button>
                    {selectedSuggestion ? (
                        <button className="ai-btn ai-btn-primary" onClick={handleSendSelected}>
                            {t('chat.ai.sendSelected')}
                        </button>
                    ) : (
                        <button className="ai-btn ai-btn-primary" onClick={handleContinueEditing}>
                            {t('chat.ai.continueEditing')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

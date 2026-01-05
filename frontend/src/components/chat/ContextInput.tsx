import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FileText, ChevronDown, Check, Loader2, ClipboardList, Save, X } from "lucide-react";
import { contextService, type ContextTemplate } from "../../services/context.service";
import "./ContextInput.css";

interface Props {
    chatId: string;
    onContextChange?: (context: string) => void;
}

export default function ContextInput({ chatId, onContextChange }: Props) {
    const { t } = useTranslation();
    const [context, setContext] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [templates, setTemplates] = useState<ContextTemplate[]>([]);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load context when chat changes
    useEffect(() => {
        if (chatId) {
            contextService.getContext(chatId).then((data) => {
                setContext(data.contextDescription || "");
                if (data.contextDescription) {
                    setIsSaved(true);
                }
            }).catch(() => {
                setContext("");
            });
        }
    }, [chatId]);

    // Load templates when showing template panel
    useEffect(() => {
        if (showTemplates) {
            contextService.getTemplates().then(setTemplates).catch(console.error);
        }
    }, [showTemplates]);

    // Auto-save context with debounce
    const handleContextChange = (value: string) => {
        setContext(value);
        onContextChange?.(value);
        setIsSaved(false);

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        if (chatId && value.trim()) {
            saveTimeoutRef.current = setTimeout(async () => {
                setIsSaving(true);
                try {
                    await contextService.updateContext(chatId, value);
                    setIsSaved(true);
                } catch (error) {
                    console.error("Failed to save context:", error);
                } finally {
                    setIsSaving(false);
                }
            }, 1000);
        }
    };

    const handleSelectTemplate = (template: ContextTemplate) => {
        setContext(template.description);
        onContextChange?.(template.description);
        setShowTemplates(false);
        setIsSaved(true);

        if (chatId) {
            contextService.updateContext(chatId, template.description).catch(console.error);
        }
    };

    const handleSaveTemplate = async () => {
        if (!newTemplateName.trim() || !context.trim()) return;

        try {
            await contextService.createTemplate(newTemplateName, context);
            setNewTemplateName("");
            setShowSaveTemplate(false);
            const updated = await contextService.getTemplates();
            setTemplates(updated);
        } catch (error) {
            console.error("Failed to save template:", error);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        try {
            await contextService.deleteTemplate(templateId);
            setTemplates(templates.filter(t => t.templateId !== templateId));
        } catch (error) {
            console.error("Failed to delete template:", error);
        }
    };

    // Get save status
    const getSaveStatus = () => {
        if (isSaving) return { text: t("chat.context.saving"), className: "saving", icon: Loader2 };
        if (isSaved && context.trim()) return { text: t("chat.context.saved"), className: "saved", icon: Check };
        return null;
    };

    const saveStatus = getSaveStatus();

    return (
        <div className={`context-input-container ${isExpanded ? "expanded" : ""}`}>
            <div className="context-header" onClick={() => setIsExpanded(!isExpanded)}>
                <FileText size={16} className="context-icon" />
                <span className="context-title">{t("chat.context.title")}</span>
                {saveStatus && (
                    <span className={`save-status ${saveStatus.className}`}>
                        <saveStatus.icon size={12} className={saveStatus.className === "saving" ? "spin" : ""} />
                        {saveStatus.text}
                    </span>
                )}
                <ChevronDown size={14} className={`expand-icon ${isExpanded ? "expanded" : ""}`} />
            </div>

            {isExpanded && (
                <div className="context-content">
                    <p className="context-help">
                        {t("chat.context.helpText")}
                    </p>
                    <textarea
                        className="context-textarea"
                        placeholder={t("chat.context.placeholder")}
                        value={context}
                        onChange={(e) => handleContextChange(e.target.value)}
                        rows={3}
                    />

                    <div className="context-actions">
                        <button
                            className="context-btn template-btn"
                            onClick={() => setShowTemplates(!showTemplates)}
                        >
                            <ClipboardList size={14} />
                            {t("chat.context.selectTemplate")}
                        </button>
                        <button
                            className="context-btn save-template-btn"
                            onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                            disabled={!context.trim()}
                            title={t("chat.context.saveAsTemplate")}
                        >
                            <Save size={14} />
                            {t("chat.context.saveAsTemplate")}
                        </button>
                    </div>

                    {showSaveTemplate && (
                        <div className="save-template-form">
                            <input
                                type="text"
                                placeholder={t("chat.context.templateName")}
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                className="template-name-input"
                            />
                            <button
                                className="context-btn confirm-btn"
                                onClick={handleSaveTemplate}
                                disabled={!newTemplateName.trim()}
                            >
                                {t("common.confirm")}
                            </button>
                        </div>
                    )}

                    {showTemplates && (
                        <div className="templates-list">
                            {templates.length === 0 ? (
                                <p className="no-templates">{t("chat.context.noTemplates")}</p>
                            ) : (
                                templates.map((template) => (
                                    <div key={template.templateId} className="template-item">
                                        <div
                                            className="template-content"
                                            onClick={() => handleSelectTemplate(template)}
                                        >
                                            <span className="template-name">{template.templateName}</span>
                                            <span className="template-preview">{template.description.slice(0, 50)}...</span>
                                        </div>
                                        <button
                                            className="delete-template-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTemplate(template.templateId);
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

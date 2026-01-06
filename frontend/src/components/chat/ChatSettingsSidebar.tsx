import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import ContextInput from "./ContextInput";
import "./ChatSettingsSidebar.css";

interface Props {
    chatId: string;
    isOpen: boolean;
    onClose: () => void;
    cultureCheckEnabled: boolean;
    onCultureCheckChange: (enabled: boolean) => void;
}

export default function ChatSettingsSidebar({
    chatId,
    isOpen,
    onClose,
    cultureCheckEnabled,
    onCultureCheckChange,
}: Props) {
    const { t } = useTranslation();

    return (
        <div className={`chat-settings-sidebar ${isOpen ? "open" : ""}`}>
            <div className="settings-sidebar-header">
                <h3 className="settings-sidebar-title">{t("chat.settings.title")}</h3>
                <button className="settings-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <div className="settings-sidebar-content">
                {/* Culture Check Toggle */}
                <div className="settings-section">
                    <div className="settings-toggle-row">
                        <div className="settings-toggle-info">
                            <span className="settings-toggle-label">
                                {t("chat.settings.cultureCheck")}
                            </span>
                            <span className="settings-toggle-desc">
                                {t("chat.settings.cultureCheckDesc")}
                            </span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={cultureCheckEnabled}
                                onChange={(e) => onCultureCheckChange(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Context Input */}
                <div className="settings-section">
                    <ContextInput chatId={chatId} />
                </div>
            </div>
        </div>
    );
}

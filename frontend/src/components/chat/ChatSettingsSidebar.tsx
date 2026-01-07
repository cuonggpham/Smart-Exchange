import { useTranslation } from "react-i18next";
import { X, Mail, Briefcase, User } from "lucide-react";
import ContextInput from "./ContextInput";
import UserAvatar from "../UserAvatar";
import type { ChatUser } from "../../services/chat.service";
import "./ChatSettingsSidebar.css";

interface Props {
    chatId: string;
    isOpen: boolean;
    onClose: () => void;
    cultureCheckEnabled: boolean;
    onCultureCheckChange: (enabled: boolean) => void;
    receiver: ChatUser;
}

export default function ChatSettingsSidebar({
    chatId,
    isOpen,
    onClose,
    cultureCheckEnabled,
    onCultureCheckChange,
    receiver,
}: Props) {
    const { t } = useTranslation();

    return (
        <div className={`chat-settings-sidebar ${isOpen ? "open" : ""}`}>
            <div className="settings-sidebar-header">
                <h3 className="settings-sidebar-title">{t("chat.settings.conversationInfo")}</h3>
                <button className="settings-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <div className="settings-sidebar-content">
                {/* User Profile Section */}
                <div className="settings-profile-section">
                    <div className="settings-profile-avatar">
                        <UserAvatar
                            src={receiver.avatar}
                            name={receiver.fullName}
                            size={80}
                        />
                    </div>
                    <h4 className="settings-profile-name">{receiver.fullName}</h4>
                    <div className="settings-profile-info">
                        <div className="settings-profile-item">
                            <Mail size={16} />
                            <span>{receiver.email}</span>
                        </div>
                        <div className="settings-profile-item">
                            <Briefcase size={16} />
                            <span>{t("chat.settings.career")}: {receiver.career || t("chat.settings.notUpdated")}</span>
                        </div>
                        <div className="settings-profile-item">
                            <User size={16} />
                            <span>{t("chat.settings.position")}: {receiver.position || t("chat.settings.notUpdated")}</span>
                        </div>
                    </div>
                </div>

                <div className="settings-divider"></div>
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

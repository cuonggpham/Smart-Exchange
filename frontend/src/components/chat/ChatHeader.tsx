import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Home } from "lucide-react";
import LanguageSwitcher from "../LanguageSwitcher";

export default function ChatHeader() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="chat-header">
            <div className="logo">
                <MessageSquare size={22} />
                {t('chat.header.appName')}
            </div>
            <div className="title">{t('chat.title')}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <LanguageSwitcher />
                <button
                    onClick={() => navigate("/home")}
                    className="secondary-btn"
                    style={{
                        width: 'auto',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    title={t('chat.sidebar.backHome')}
                >
                    <Home size={18} />
                    <span>{t('chat.sidebar.backHome')}</span>
                </button>
            </div>
        </div>
    );
}

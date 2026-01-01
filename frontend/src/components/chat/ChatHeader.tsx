import { useTranslation } from "react-i18next";
import MenuButton from "./MenuButton";
import LanguageSwitcher from "../LanguageSwitcher";

export default function ChatHeader() {
    const { t } = useTranslation();
    
    return (
        <div className="chat-header">
            <div className="logo">{t('chat.header.appName')}</div>
            <div className="title">{t('chat.title')}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <LanguageSwitcher />
                <MenuButton />
            </div>
        </div>
    );
}

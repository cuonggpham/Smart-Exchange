import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Globe } from "lucide-react";
import VietnamFlag from "./flags/VietnamFlag";
import JapanFlag from "./flags/JapanFlag";

const LanguageSwitcher: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useAuth();

    const languages = [
        {
            code: "vi",
            label: "VI",
            FlagComponent: VietnamFlag,
            name: t("lang.vietnamese")
        },
        {
            code: "jp",
            label: "JP",
            FlagComponent: JapanFlag,
            name: t("lang.japanese")
        },
    ];

    return (
        <div className="lang-switch-wrapper">
            <div className="lang-switch-header">
                <Globe size={14} className="lang-switch-icon" />
                <span className="lang-switch-label">{t("lang.language")}</span>
            </div>
            <div className="lang-switch">
                <div className={`lang-switch-slider ${settings.language}`}></div>
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        type="button"
                        className={`lang-btn ${settings.language === lang.code ? "active" : ""}`}
                        onClick={() => updateSettings({ language: lang.code as "vi" | "jp" })}
                        aria-label={lang.name}
                        title={lang.name}
                    >
                        <span className="lang-flag">
                            <lang.FlagComponent size={20} />
                        </span>
                        <span className="lang-label">{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;

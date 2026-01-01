import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

const LanguageSwitcher: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useAuth();

    return (
        <div className="lang-switch">
            <button
                type="button"
                className={`lang-btn ${settings.language === "vi" ? "active" : ""}`}
                onClick={() => updateSettings({ language: "vi" })}
                aria-label={t("lang.ariaVi")}
            >
                VI
            </button>
            <button
                type="button"
                className={`lang-btn ${settings.language === "jp" ? "active" : ""}`}
                onClick={() => updateSettings({ language: "jp" })}
                aria-label={t("lang.ariaJp")}
            >
                JP
            </button>
        </div>
    );
};

export default LanguageSwitcher;

import React from "react";
import { useTranslation } from "react-i18next";

const SecuritySettings: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">{t("settings.security.title")}</h2>
            <p className="settings-card-subtitle">{t("settings.security.subtitle")}</p>

            <div className="settings-option">
                <p className="settings-footnote">{t("settings.security.comingSoon")}</p>
            </div>
        </div>
    );
};

export default SecuritySettings;


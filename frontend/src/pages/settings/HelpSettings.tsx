import React from "react";
import { useTranslation } from "react-i18next";

const HelpSettings: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">{t("settings.help.title")}</h2>
            <p className="settings-card-subtitle">{t("settings.help.subtitle")}</p>

            <div className="settings-option">
                <p className="settings-footnote">{t("settings.help.comingSoon")}</p>
            </div>
        </div>
    );
};

export default HelpSettings;


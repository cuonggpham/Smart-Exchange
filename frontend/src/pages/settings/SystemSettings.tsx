import React from "react";
import { useTranslation } from "react-i18next";

const SystemSettings: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">{t("settings.system.title")}</h2>
            <p className="settings-card-subtitle">{t("settings.system.subtitle")}</p>

            <div className="settings-option">
                <p className="settings-footnote">{t("settings.system.comingSoon")}</p>
            </div>
        </div>
    );
};

export default SystemSettings;


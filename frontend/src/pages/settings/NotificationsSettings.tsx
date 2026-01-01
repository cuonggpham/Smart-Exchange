import React from "react";
import { useTranslation } from "react-i18next";

const NotificationsSettings: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">{t("settings.notifications.title")}</h2>
            <p className="settings-card-subtitle">{t("settings.notifications.subtitle")}</p>

            <div className="settings-option">
                <p className="settings-footnote">{t("settings.notifications.comingSoon")}</p>
            </div>
        </div>
    );
};

export default NotificationsSettings;


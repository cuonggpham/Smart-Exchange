import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const SettingsOverview: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const username = user?.email?.split("@")[0] || "N/A";
    const email = user?.email || "N/A";

    const goToProfile = () => navigate("/profile");

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">{t("settings.overview.title")}</h2>

            <div className="account-info">
                <div className="account-info-row">
                    <span className="account-info-label">{t("settings.overview.usernameLabel")}:</span>
                    <span className="account-info-value">{username}</span>
                </div>
                <div className="account-info-row">
                    <span className="account-info-label">{t("settings.overview.emailLabel")}:</span>
                    <span className="account-info-value">{email}</span>
                </div>
            </div>

            <button className="settings-primary-btn" type="button" onClick={goToProfile}>
                {t("settings.overview.edit")}
            </button>
        </div>
    );
};

export default SettingsOverview;


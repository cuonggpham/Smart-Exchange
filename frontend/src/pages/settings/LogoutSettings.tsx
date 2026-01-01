import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

const LogoutSettings: React.FC = () => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        setError(null);
        setLoading(true);
        try {
            await logout();
        } catch (err) {
            const e = err as Error;
            setError(e.message || t("settings.common.error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">{t("settings.logout.title")}</h2>
            <p className="settings-card-subtitle">{t("settings.logout.subtitle")}</p>
            {error && <div className="settings-alert error">{error}</div>}
            <button className="settings-danger-btn" onClick={handleLogout} disabled={loading}>
                {loading ? t("settings.logout.processing") : t("settings.logout.cta")}
            </button>
        </div>
    );
};

export default LogoutSettings;


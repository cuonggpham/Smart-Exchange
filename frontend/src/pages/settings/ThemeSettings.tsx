import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

const ThemeSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleChange = async (theme: "light" | "dark") => {
        setSaving(true);
        // updateSettings không throw error nữa, chỉ sync với backend
        // Settings được apply ngay lập tức
        await updateSettings({ theme });
        setSaving(false);
    };

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">{t("settings.theme.title")}</h2>
            <p className="settings-card-subtitle">{t("settings.theme.subtitle")}</p>

            <div className="settings-option">
                <div className="theme-toggle-container">
                    <label className="settings-label">{t("settings.theme.label")}</label>
                    <div className="theme-toggle-wrapper">
                        <span className={`theme-label ${settings.theme === "light" ? "active" : ""}`}>
                            {t("settings.theme.options.light")}
                        </span>
                        <label className="theme-toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.theme === "dark"}
                                onChange={(e) => handleChange(e.target.checked ? "dark" : "light")}
                            />
                            <span className="theme-toggle-slider"></span>
                        </label>
                        <span className={`theme-label ${settings.theme === "dark" ? "active" : ""}`}>
                            {t("settings.theme.options.dark")}
                        </span>
                    </div>
                </div>
            </div>

            <p className="settings-footnote">
                {saving ? t("settings.common.saving") : t("settings.common.autoSave")}
            </p>
        </div>
    );
};

export default ThemeSettings;


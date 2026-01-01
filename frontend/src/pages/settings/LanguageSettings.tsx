import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";

const LanguageSettings: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useAuth();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = async (lang: "vi" | "jp") => {
        setError(null);
        setSaving(true);
        try {
            await updateSettings({ language: lang });
        } catch (err) {
            const e = err as Error;
            setError(e.message || t("settings.common.error"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">{t("settings.language.title")}</h2>
            <p className="settings-card-subtitle">{t("settings.language.subtitle")}</p>

            {error && <div className="settings-alert error">{error}</div>}

            <div className="settings-option">
                <label className="settings-label">{t("settings.language.label")}</label>
                <div className="settings-radio-group">
                    <label className={`radio-pill ${settings.language === "vi" ? "active" : ""}`}>
                        <input
                            type="radio"
                            name="language"
                            value="vi"
                            checked={settings.language === "vi"}
                            onChange={() => handleChange("vi")}
                        />
                        <span>{t("settings.language.options.vi")}</span>
                    </label>
                    <label className={`radio-pill ${settings.language === "jp" ? "active" : ""}`}>
                        <input
                            type="radio"
                            name="language"
                            value="jp"
                            checked={settings.language === "jp"}
                            onChange={() => handleChange("jp")}
                        />
                        <span>{t("settings.language.options.jp")}</span>
                    </label>
                </div>
            </div>

            <p className="settings-footnote">
                {saving ? t("settings.common.saving") : t("settings.common.autoSave")}
            </p>
        </div>
    );
};

export default LanguageSettings;


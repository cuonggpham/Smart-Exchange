import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

const HomePage: React.FC = () => {
    const { t } = useTranslation();
    const { user, settings, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    // Style nút đồng nhất
    const buttonStyle: React.CSSProperties = {
        padding: "0.6rem 1.2rem",
        cursor: "pointer",
        border: "none",
        borderRadius: "4px",
        color: "white",
        minWidth: "140px",
        textAlign: "center",
        display: "inline-block",
    };

    const primaryBtn = { ...buttonStyle, backgroundColor: "#667eea" };
    const secondaryBtn = { ...buttonStyle, backgroundColor: "#007bff" };
    const dangerBtn = { ...buttonStyle, backgroundColor: "#dc3545" };

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
    };

    return (
        <div style={{ padding: "2rem" }}>
            <header className="auth-header">
                <div className="app-name">{t('home.appName')}</div>
            </header>

            <h1>{t('home.title')}</h1>

            <div style={{ marginTop: "1rem" }}>
                <p>
                    <strong>{t('home.userInfo.email')}:</strong> {user?.email}
                </p>
                <p>
                    <strong>{t('home.userInfo.jobTitle')}:</strong> {user?.jobTitle || t('home.userInfo.notAvailable')}
                </p>
                <p>
                    <strong>{t('home.userInfo.language')}:</strong> {settings?.language || t('home.userInfo.notAvailable')}
                </p>
                <p>
                    <strong>{t('home.userInfo.theme')}:</strong> {settings?.theme || t('home.userInfo.notAvailable')}
                </p>
            </div>

            {/* Các nút hành động */}
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                <button onClick={() => navigate("/profile")} style={primaryBtn}>
                    {t('home.actions.goToProfile')}
                </button>

                <button onClick={() => navigate("/settings")} style={primaryBtn}>
                    {t('home.actions.goToSettings')}
                </button>

                <button onClick={() => navigate("/chat")} style={secondaryBtn}>
                    {t('home.actions.goToChat')}
                </button>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                disabled={loading}
                style={{
                    ...dangerBtn,
                    marginTop: "1.5rem",
                    opacity: loading ? 0.6 : 1,
                }}
            >
                {loading ? t('home.actions.loggingOut') : t('home.actions.logout')}
            </button>
        </div>
    );
};

export default HomePage;

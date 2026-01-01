import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "../styles/SettingsPage.css";

// Icon components với màu sắc theo hình ảnh
const AccountIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
            fill="#2563eb"
        />
        <path
            d="M12 14C7.58172 14 4 15.7909 4 18V22H20V18C20 15.7909 16.4183 14 12 14Z"
            fill="#2563eb"
        />
    </svg>
);

const AppearanceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
            fill="#f97316"
        />
        <path
            d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"
            fill="#f97316"
        />
        <circle cx="12" cy="12" r="2" fill="#f97316" />
    </svg>
);

const LanguageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.88L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z"
            fill="#06b6d4"
        />
    </svg>
);

const NotificationsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
            fill="#eab308"
        />
    </svg>
);

const SecurityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.8 8.6 14.8 10V11.5H16.5V17H7.5V11.5H9.2V10C9.2 8.6 10.6 7 12 7ZM12 8.2C11.2 8.2 10.5 8.7 10.5 10V11.5H13.5V10C13.5 8.7 12.8 8.2 12 8.2Z"
            fill="#f59e0b"
        />
    </svg>
);

const SystemIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.37C21.34 9.22 21.38 8.95 21.23 8.76L19.26 6.24C19.11 6.05 18.84 6.02 18.65 6.17L16.65 7.86C16.18 7.5 15.66 7.21 15.1 7L14.83 4.79C14.8 4.57 14.63 4.4 14.41 4.4H9.59C9.37 4.4 9.2 4.57 9.17 4.79L8.9 7C8.34 7.21 7.82 7.5 7.35 7.86L5.35 6.17C5.16 6.02 4.89 6.05 4.74 6.24L2.77 8.76C2.62 8.95 2.66 9.22 2.84 9.37L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.84 14.63C2.66 14.78 2.62 15.05 2.77 15.24L4.74 17.76C4.89 17.95 5.16 17.98 5.35 17.83L7.35 16.14C7.82 16.5 8.34 16.79 8.9 17L9.17 19.21C9.2 19.43 9.37 19.6 9.59 19.6H14.41C14.63 19.6 14.8 19.43 14.83 19.21L15.1 17C15.66 16.79 16.18 16.5 16.65 16.14L18.65 17.83C18.84 17.98 19.11 17.95 19.26 17.76L21.23 15.24C21.38 15.05 21.34 14.78 21.16 14.63L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z"
            fill="#3b82f6"
        />
    </svg>
);

const HelpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.67 11.45 12.9 12.17 12.17L13.25 11.09C13.66 10.69 13.84 10.19 13.84 9.69C13.84 8.69 13.14 8 12.14 8C11.14 8 10.5 8.5 10.5 9.5H8.5C8.5 7.5 10.5 6 12.5 6C14.5 6 16.5 7.5 16.5 9.5C16.5 10.5 16 11.25 15.07 11.25Z"
            fill="#ef4444"
        />
    </svg>
);

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const menuItems = [
        { key: "account", label: t("settings.menu.account"), to: "/settings", icon: AccountIcon },
        {
            key: "theme",
            label: t("settings.menu.theme"),
            to: "/settings/theme",
            icon: AppearanceIcon,
        },
        {
            key: "language",
            label: t("settings.menu.language"),
            to: "/settings/language",
            icon: LanguageIcon,
        },
        {
            key: "notifications",
            label: t("settings.menu.notifications"),
            to: "/settings/notifications",
            icon: NotificationsIcon,
        },
        {
            key: "security",
            label: t("settings.menu.security"),
            to: "/settings/security",
            icon: SecurityIcon,
        },
        {
            key: "system",
            label: t("settings.menu.system"),
            to: "/settings/system",
            icon: SystemIcon,
        },
        { key: "help", label: t("settings.menu.help"), to: "/settings/help", icon: HelpIcon },
    ];

    return (
        <div className="settings-layout">
            <header className="settings-header">
                <NavLink to="/" className="back-link">
                    ← {t("settings.backHome")}
                </NavLink>
                <h1 className="settings-title">{t("settings.title")}</h1>
                <div className="settings-header-right">
                    <LanguageSwitcher />
                    <div className="settings-user-chip">
                        {t("settings.userDisplay", {
                            username: user?.email?.split("@")[0] || "N/A",
                        })}
                    </div>
                </div>
            </header>

            <div className="settings-body">
                <aside className="settings-sidebar">
                    <div className="settings-menu-title">{t("settings.menu.title")}</div>
                    <nav className="settings-menu">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink
                                    key={item.key}
                                    to={item.to}
                                    end={item.to === "/settings"}
                                    className={({ isActive }) =>
                                        `settings-menu-item ${isActive ? "active" : ""}`
                                    }
                                >
                                    <div className="menu-item-content">
                                        <span className="menu-icon">
                                            <IconComponent />
                                        </span>
                                        <span className="menu-label">{item.label}</span>
                                    </div>
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                <section className="settings-content">
                    <Outlet />
                </section>
            </div>
        </div>
    );
};

export default SettingsPage;

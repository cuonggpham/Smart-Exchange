import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/SettingsPage.css";

import {
    User,
    Palette,
    Languages,
    Bell,
    ShieldCheck,
    Settings2,
    HelpCircle
} from "lucide-react";

// Icon components mapping to Lucide for simple, modern look
const AccountIcon = () => <User size={20} color="#2563eb" />;
const AppearanceIcon = () => <Palette size={20} color="#f97316" />;
const LanguageIcon = () => <Languages size={20} color="#06b6d4" />;
const NotificationsIcon = () => <Bell size={20} color="#eab308" />;
const SecurityIcon = () => <ShieldCheck size={20} color="#f59e0b" />;
const SystemIcon = () => <Settings2 size={20} color="#3b82f6" />;
const HelpIcon = () => <HelpCircle size={20} color="#ef4444" />;

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();

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

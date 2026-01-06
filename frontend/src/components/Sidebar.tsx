import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
    MessageSquare,
    User,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Home,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        setIsLoggingOut(false);
    };

    const navItems = [
        { path: "/home", icon: Home, label: t("navbar.home") },
        { path: "/chat", icon: MessageSquare, label: t("navbar.chat") },
        { path: "/profile", icon: User, label: t("navbar.profile") },
        { path: "/settings", icon: Settings, label: t("navbar.settings") },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {/* Logo / Brand */}
            <div
                className="sidebar-brand"
                onClick={() => navigate("/home")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/home")}
            >
                <span className="sidebar-logo">SE</span>
                {!isCollapsed && <span className="sidebar-title">Smart EXchange</span>}
            </div>

            {/* Toggle Button */}
            <button
                className="sidebar-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                        title={isCollapsed ? item.label : undefined}
                    >
                        <item.icon size={20} />
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section - User */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        <User size={18} />
                    </div>
                    {!isCollapsed && (
                        <span className="sidebar-user-name">
                            {user?.email?.split("@")[0] || "User"}
                        </span>
                    )}
                </div>
                <div className={`sidebar-lang-container ${isCollapsed ? "collapsed" : ""}`}>
                    <LanguageSwitcher />
                </div>
                <button
                    className="sidebar-link logout"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    title={isCollapsed ? t("navbar.logout") : undefined}
                >
                    <LogOut size={20} />
                    {!isCollapsed && (
                        <span>
                            {isLoggingOut ? t("common.processing") : t("navbar.logout")}
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

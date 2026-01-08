import React, { useState, useRef, useEffect } from "react";
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
    History,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import UserAvatar from "./UserAvatar";

const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
    const avatarMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setIsAvatarMenuOpen(false);
        await logout();
        setIsLoggingOut(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
                setIsAvatarMenuOpen(false);
            }
        };

        if (isAvatarMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isAvatarMenuOpen]);

    const navItems = [
        { path: "/home", icon: Home, label: t("navbar.home") },
        { path: "/chat", icon: MessageSquare, label: t("navbar.chat") },
        { path: "/history", icon: History, label: t("navbar.history") },
    ];

    const handleMenuItemClick = (path: string) => {
        navigate(path);
        setIsAvatarMenuOpen(false);
    };

    return (
        <aside className={`sidebar hidden-mobile ${isCollapsed ? "collapsed" : ""}`}>
            {/* Logo / Brand */}
            <div
                className="sidebar-brand"
                onClick={() => navigate("/home")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/home")}
            >
                <img src="/logo.png" alt="Logo" className="sidebar-logo-img" />
                {!isCollapsed && (
                    <div className="sidebar-brand-text">
                        <span className="sidebar-brand-smart">Smart</span>
                        <span className="sidebar-brand-ex">EXCHANGE</span>
                    </div>
                )}
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
                        <item.icon size={24} />
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section - User */}
            <div className="sidebar-footer">
                <div className="sidebar-avatar-wrapper" ref={avatarMenuRef}>
                    <div
                        className="sidebar-user clickable"
                        onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                    >
                        <div className="sidebar-avatar">
                            <UserAvatar
                                src={user?.avatar}
                                name={user?.fullName || user?.email || "User"}
                                size={44}
                                borderRadius="8px"
                            />
                        </div>
                        {!isCollapsed && (
                            <span className="sidebar-user-name">
                                {user?.fullName || user?.email?.split("@")[0] || "User"}
                            </span>
                        )}
                    </div>

                    {/* Avatar Dropdown Menu */}
                    {isAvatarMenuOpen && (
                        <div className={`avatar-dropdown-menu ${isCollapsed ? "collapsed-position" : ""}`}>
                            <div className="avatar-menu-header">
                                <UserAvatar
                                    src={user?.avatar}
                                    name={user?.fullName || user?.email || "User"}
                                    size={40}
                                    borderRadius="8px"
                                />
                                <div className="avatar-menu-user-info">
                                    <span className="avatar-menu-name">
                                        {user?.fullName || "User"}
                                    </span>
                                    <span className="avatar-menu-email">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                            <div className="avatar-menu-divider" />
                            <button
                                className="avatar-menu-item"
                                onClick={() => handleMenuItemClick("/profile")}
                            >
                                <User size={20} />
                                <span>{t("navbar.profile")}</span>
                            </button>
                            <button
                                className="avatar-menu-item"
                                onClick={() => handleMenuItemClick("/settings")}
                            >
                                <Settings size={20} />
                                <span>{t("navbar.settings")}</span>
                            </button>
                            <div className="avatar-menu-divider" />
                            {/* Language Switcher */}
                            <div className="avatar-menu-lang-section">
                                <LanguageSwitcher />
                            </div>
                            <div className="avatar-menu-divider" />
                            <button
                                className="avatar-menu-item logout"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LogOut size={20} />
                                <span>
                                    {isLoggingOut ? t("common.processing") : t("navbar.logout")}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

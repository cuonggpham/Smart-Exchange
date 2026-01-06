import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
    MessageSquare,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
} from "lucide-react";
import UserAvatar from "./UserAvatar";

const Navbar: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        setIsLoggingOut(false);
    };

    // Main navigation - only Chat (Home via logo)
    const navItems = [
        { path: "/chat", icon: MessageSquare, label: t("navbar.chat") },
    ];

    // User menu items
    const userMenuItems = [
        { path: "/profile", icon: User, label: t("navbar.profile") },
        { path: "/settings", icon: Settings, label: t("navbar.settings") },
    ];

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleUserMenuItemClick = (path: string) => {
        setIsUserMenuOpen(false);
        navigate(path);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo / Brand */}
                <div
                    className="navbar-brand"
                    onClick={() => navigate("/home")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/home")}
                >
                    <span className="navbar-logo">SE</span>
                    <span className="navbar-title">Smart EXchange</span>
                </div>

                {/* Desktop Navigation */}
                <div className="navbar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `navbar-link ${isActive ? "active" : ""}`
                            }
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                {/* User Menu */}
                <div className="navbar-user">
                    <button
                        className="navbar-user-btn"
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        aria-expanded={isUserMenuOpen}
                        aria-haspopup="true"
                    >
                        <div className="navbar-avatar">
                            <UserAvatar
                                src={user?.avatar}
                                name={user?.fullName || user?.email || "User"}
                                size={32}
                            />
                        </div>
                        <span className="navbar-user-name">
                            {user?.fullName || user?.email?.split("@")[0] || "User"}
                        </span>
                        <ChevronDown
                            size={16}
                            className={`navbar-chevron ${isUserMenuOpen ? "open" : ""}`}
                        />
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                        <>
                            <div
                                className="navbar-overlay"
                                onClick={() => setIsUserMenuOpen(false)}
                            />
                            <div className="navbar-dropdown">
                                <div className="navbar-dropdown-header">
                                    <span className="navbar-dropdown-email">
                                        {user?.email}
                                    </span>
                                </div>
                                <div className="navbar-dropdown-divider" />
                                {userMenuItems.map((item) => (
                                    <button
                                        key={item.path}
                                        className="navbar-dropdown-item"
                                        onClick={() => handleUserMenuItemClick(item.path)}
                                    >
                                        <item.icon size={16} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                                <div className="navbar-dropdown-divider" />
                                <button
                                    className="navbar-dropdown-item danger"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    <LogOut size={16} />
                                    <span>
                                        {isLoggingOut
                                            ? t("common.processing")
                                            : t("navbar.logout")}
                                    </span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="navbar-mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={t("navbar.menu")}
                    aria-expanded={isMobileMenuOpen}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <>
                    <div className="navbar-mobile-overlay" onClick={closeMobileMenu} />
                    <div className="navbar-mobile-menu">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `navbar-mobile-link ${isActive ? "active" : ""}`
                                }
                                onClick={closeMobileMenu}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <div className="navbar-mobile-divider" />
                        <div className="navbar-mobile-user">
                            <span className="navbar-mobile-email">{user?.email}</span>
                        </div>
                        {userMenuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `navbar-mobile-link ${isActive ? "active" : ""}`
                                }
                                onClick={closeMobileMenu}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                        <div className="navbar-mobile-divider" />
                        <button
                            className="navbar-mobile-link danger"
                            onClick={() => {
                                closeMobileMenu();
                                handleLogout();
                            }}
                            disabled={isLoggingOut}
                        >
                            <LogOut size={20} />
                            <span>
                                {isLoggingOut
                                    ? t("common.processing")
                                    : t("navbar.logout")}
                            </span>
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;


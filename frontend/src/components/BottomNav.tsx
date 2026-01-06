import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, MessageSquare, History, User } from "lucide-react";

const BottomNav: React.FC = () => {
    const { t } = useTranslation();

    const navItems = [
        { path: "/home", icon: Home, label: t("navbar.home") },
        { path: "/chat", icon: MessageSquare, label: t("navbar.chat") },
        { path: "/history", icon: History, label: t("navbar.history") },
        { path: "/profile", icon: User, label: t("navbar.profile") },
    ];

    return (
        <nav className="bottom-nav only-mobile">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `bottom-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    <item.icon size={22} />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;

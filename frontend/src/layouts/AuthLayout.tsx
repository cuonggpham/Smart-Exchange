import React from "react";
import LanguageSwitcher from "../components/LanguageSwitcher";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
    return (
        <div className="auth-page">
            <header className="auth-header">
                <div className="app-name">Smart Exchange</div>
                <LanguageSwitcher />
            </header>

            <main className="auth-main">
                <div className="auth-card">
                    <h1 className="auth-title">{title}</h1>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;

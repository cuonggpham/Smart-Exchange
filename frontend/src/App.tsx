import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

/* ===== Pages ===== */
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import TutorialPage from "./pages/TutorialPage/TutorialPage";

/* ===== Settings ===== */
import SettingsPage from "./pages/SettingsPage";
import SettingsOverview from "./pages/settings/SettingsOverview";
import LanguageSettings from "./pages/settings/LanguageSettings";
import ThemeSettings from "./pages/settings/ThemeSettings";
import NotificationsSettings from "./pages/settings/NotificationsSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import SystemSettings from "./pages/settings/SystemSettings";
import HelpSettings from "./pages/settings/HelpSettings";
import LogoutSettings from "./pages/settings/LogoutSettings";

/* ===== Contexts & Layouts ===== */
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SocketProvider } from "./contexts/SocketContext";

import { ProtectedLayout } from "./layouts/ProtectedLayout";
import { PublicRoute } from "./components/PublicRoute";

/* ===== Guards ===== */

// Nếu user CHƯA hoàn thành tutorial → đá sang /tutorial
const HomeGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading)
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (user && !user.isTutorialCompleted) {
        return <Navigate to="/tutorial" replace />;
    }

    return <>{children}</>;
};

// Nếu user ĐÃ hoàn thành tutorial → không cho vào /tutorial nữa
const TutorialGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading)
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (user && user.isTutorialCompleted) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};

function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <BrowserRouter>
                <AuthProvider>
                    <ThemeProvider>
                        <LanguageProvider>
                            <SocketProvider>
                                <Routes>

                                    {/* ===== LANDING (ROOT – KHÔNG GUARD) ===== */}
                                    <Route path="/" element={<LandingPage />} />

                                    {/* ===== PUBLIC (LOGIN / REGISTER) ===== */}
                                    <Route element={<PublicRoute />}>
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/register" element={<RegisterPage />} />
                                    </Route>

                                    {/* ===== PROTECTED ===== */}
                                    <Route element={<ProtectedLayout />}>
                                        <Route
                                            path="/home"
                                            element={
                                                <HomeGuard>
                                                    <HomePage />
                                                </HomeGuard>
                                            }
                                        />

                                        <Route
                                            path="/tutorial"
                                            element={
                                                <TutorialGuard>
                                                    <TutorialPage />
                                                </TutorialGuard>
                                            }
                                        />

                                        <Route path="/chat" element={<ChatPage />} />
                                        <Route path="/profile" element={<ProfilePage />} />

                                        <Route path="/settings" element={<SettingsPage />}>
                                            <Route index element={<SettingsOverview />} />
                                            <Route path="language" element={<LanguageSettings />} />
                                            <Route path="theme" element={<ThemeSettings />} />
                                            <Route path="notifications" element={<NotificationsSettings />} />
                                            <Route path="security" element={<SecuritySettings />} />
                                            <Route path="system" element={<SystemSettings />} />
                                            <Route path="help" element={<HelpSettings />} />
                                            <Route path="logout" element={<LogoutSettings />} />
                                        </Route>
                                    </Route>

                                    {/* ===== FALLBACK ===== */}
                                    <Route path="*" element={<Navigate to="/" replace />} />

                                </Routes>
                            </SocketProvider>
                        </LanguageProvider>
                    </ThemeProvider>
                </AuthProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;

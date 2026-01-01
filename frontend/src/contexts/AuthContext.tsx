import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import i18n from "../i18n";
import { authService, userService } from "../services/api";

/* ================= TYPES ================= */

interface User {
    id: string;
    email: string;
    jobTitle: string | null;
    isTutorialCompleted: boolean;
}

export type AppLanguage = "vi" | "jp";
export type AppTheme = "light" | "dark";

export interface SettingsState {
    language: AppLanguage;
    theme: AppTheme;
}

interface AuthContextType {
    user: User | null;
    settings: SettingsState;
    loading: boolean;
    setUser: (user: User | null) => void;

    // 👇 BẮT BUỘC GIỮ – LoginPage ĐANG DÙNG
    applySettings: (settings: SettingsState) => void;

    updateSettings: (partial: Partial<SettingsState>) => Promise<void>;
    refreshSettingsFromServer: () => Promise<void>;
    logout: () => Promise<void>;
}

/* ================= CONSTANTS ================= */

const DEFAULT_SETTINGS: SettingsState = {
    language: "vi",
    theme: "light",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeLanguage = (lang?: string): AppLanguage =>
    lang === "vi" || lang === "jp" ? lang : DEFAULT_SETTINGS.language;

const normalizeTheme = (theme?: string): AppTheme =>
    theme === "light" || theme === "dark" ? theme : DEFAULT_SETTINGS.theme;

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    /* ===== APPLY SETTINGS (CORE) ===== */
    const applyVisualSettings = (next: SettingsState) => {
        i18n.changeLanguage(next.language);
        document.documentElement.setAttribute("data-theme", next.theme);
    };

    const applySettings = (next: SettingsState) => {
        const merged = { ...DEFAULT_SETTINGS, ...next };
        setSettings(merged);
        applyVisualSettings(merged);
        localStorage.setItem("settings", JSON.stringify(merged));
    };

    /* ===== LOAD LOCAL SETTINGS (KHÔNG ĐỤNG AUTH) ===== */
    useEffect(() => {
        const saved = localStorage.getItem("settings");
        if (saved) {
            try {
                applySettings(JSON.parse(saved));
            } catch {
                applySettings(DEFAULT_SETTINGS);
            }
        } else {
            applySettings(DEFAULT_SETTINGS);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ===== VERIFY SESSION (KHÔNG GÂY TRẮNG TRANG) ===== */
    useEffect(() => {
        const verifySession = async () => {
            try {
                const currentUser = await userService.getCurrentUser();

                setUser({
                    id: currentUser.userId,
                    email: currentUser.email,
                    jobTitle: currentUser.jobTitle,
                    isTutorialCompleted: currentUser.isTutorialCompleted ?? false,
                });

                applySettings({
                    language: normalizeLanguage(currentUser.languageCode),
                    theme: normalizeTheme(currentUser.themeMode),
                });
            } catch {
                // ❗ CHƯA LOGIN / TOKEN HẾT HẠN
                setUser(null);
                applySettings(DEFAULT_SETTINGS);
            } finally {
                // 🔥 DÒNG QUAN TRỌNG NHẤT – KHÔNG CÓ LÀ TRẮNG
                setLoading(false);
            }
        };

        verifySession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ===== UPDATE SETTINGS ===== */
    const updateSettings = async (partial: Partial<SettingsState>) => {
        const next = { ...settings, ...partial };
        applySettings(next);

        if (!user) return;

        try {
            const updatedUser = await userService.updateUser(user.id, {
                language: next.language,
                themeMode: next.theme,
            });

            applySettings({
                language: normalizeLanguage(updatedUser.languageCode),
                theme: normalizeTheme(updatedUser.themeMode),
            });
        } catch {
            // dùng local, không crash
        }
    };

    /* ===== REFRESH SETTINGS ===== */
    const refreshSettingsFromServer = async () => {
        if (!user) return;
        try {
            const currentUser = await userService.getCurrentUser();
            applySettings({
                language: normalizeLanguage(currentUser.languageCode),
                theme: normalizeTheme(currentUser.themeMode),
            });
        } catch {}
    };

    /* ===== LOGOUT ===== */
    const logout = async () => {
        try {
            await authService.logout();
        } catch {}

        setUser(null);
        applySettings(DEFAULT_SETTINGS);
        localStorage.clear();
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                settings,
                loading,
                setUser,
                applySettings, // ✅ LOGIN / LANGUAGE SWITCHER DÙNG
                updateSettings,
                refreshSettingsFromServer,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/* ================= HOOK ================= */

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

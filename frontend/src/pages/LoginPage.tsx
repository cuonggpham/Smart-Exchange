import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../layouts/AuthLayout";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";
import { authService } from "~/services/api";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { setUser, applySettings } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError(t("auth.login.errorMissing"));
            return;
        }

        try {
            setLoading(true);
            const result = await authService.login({ email, password });

            localStorage.setItem("user", JSON.stringify(result.user));
            applySettings({
                language: result.settings.language as "vi" | "jp",
                theme: result.settings.theme as "light" | "dark",
            });
            setUser(result.user);
            navigate("/home");
        } catch (err) {
            console.error("Login error:", err);
            const error = err as Error;
            setError(error?.message || t("auth.login.errorLoginFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) {
            setError(t("auth.login.googleError"));
            return;
        }

        try {
            setLoading(true);

            const result = await authService.loginWithGoogle({
                token: credentialResponse.credential,
            });

            localStorage.setItem("user", JSON.stringify(result.user));
            localStorage.setItem("settings", JSON.stringify(result.settings));

            applySettings({
                language: result.settings.language as "vi" | "jp",
                theme: result.settings.theme as "light" | "dark",
            });
            setUser(result.user);
            navigate("/home");
        } catch (err) {
            console.error("Google login error:", err);
            const error = err as Error;
            setError(error?.message || t("auth.login.googleError"));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError(t("auth.login.googleError"));
    };

    return (
        <AuthLayout title={t("auth.login.title")}>
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <TextInput
                    label={t("auth.login.emailLabel")}
                    type="email"
                    placeholder={t("auth.login.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <TextInput
                    label={t("auth.login.passwordLabel")}
                    type="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <PrimaryButton type="submit" disabled={loading}>
                    {loading ? t("auth.login.loginProcessing") : t("auth.login.submit")}
                </PrimaryButton>
            </form>

            <div style={{ marginTop: "12px" }}>
                <GoogleLogin
                    key={i18n.language}
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="signin_with"
                    shape="rectangular"
                    locale={i18n.language === "vi" ? "vi" : "ja"}
                />
            </div>

            <div className="auth-bottom-text">
                {t("auth.login.noAccount")}{" "}
                <Link to="/register" className="link">
                    {t("auth.login.register")}
                </Link>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GoogleLogin } from "@react-oauth/google";
import AuthLayout from "../layouts/AuthLayout";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";
import { authService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!fullName || !email || !password || !passwordConfirm) {
            setError(t("auth.register.errorMissing"));
            return;
        }

        if (password !== passwordConfirm) {
            setError(t("auth.register.errorPasswordMismatch"));
            return;
        }

        try {
            setLoading(true);
            await authService.register({
                fullName,
                email,
                password,
            });

            navigate("/login");
        } catch (err: any) {
            setError(err?.message || t("auth.register.errorGeneric"));
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

            setUser(result.user);
            navigate("/");
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
        <AuthLayout title={t("auth.register.title")}>
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <TextInput
                    label={t("auth.register.fullNameLabel")}
                    type="text"
                    placeholder={t("auth.register.fullNamePlaceholder")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />

                <TextInput
                    label={t("auth.register.emailLabel")}
                    type="email"
                    placeholder={t("auth.register.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <TextInput
                    label={t("auth.register.passwordLabel")}
                    type="password"
                    placeholder={t("auth.register.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <TextInput
                    label={t("auth.register.passwordConfirmLabel")}
                    type="password"
                    placeholder={t("auth.register.passwordConfirmPlaceholder")}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                />

                <PrimaryButton type="submit" disabled={loading}>
                    {loading ? t("auth.register.registerProcessing") : t("auth.register.submit")}
                </PrimaryButton>
            </form>

            <div style={{ marginTop: "12px" }}>
                <GoogleLogin
                    key={i18n.language}
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="signup_with"
                    shape="rectangular"
                    locale={i18n.language === "vi" ? "vi" : "ja"}
                />
            </div>

            <div className="auth-bottom-text">
                {t("auth.register.bottomText")}{" "}
                <Link to="/login" className="link">
                    {t("auth.register.bottomLinkText")}
                </Link>
            </div>
        </AuthLayout>
    );
};

export default RegisterPage;

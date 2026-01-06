import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "~/services/api";
import "../styles/ProfilePage.css";
import UserAvatar from "../components/UserAvatar";

interface ProfileFormData {
    email: string;
    fullName: string;
    career: string;
    position: string;
    avatar: string;
    avatarFile?: File;
}

const ProfilePage: React.FC = () => {
    const { t } = useTranslation();
    const { user, refreshUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<ProfileFormData>({
        email: "",
        fullName: "",
        career: "",
        position: "",
        avatar: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) return;

        const [career, position] = (user.jobTitle || "")
            .split(":::")
            .map((s) => s.trim());

        const avatarKey = `smart_exchange_avatar_${user.id}`;
        const savedAvatar = localStorage.getItem(avatarKey) || "";

        setFormData((prev) => ({
            ...prev,
            email: user.email,
            fullName: user.fullName || "",
            career: career || "",
            position: position || "",
            avatar: user.avatar || savedAvatar || prev.avatar || "",
        }));
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setSuccess(false);
    };

    const handleAvatarFileChange = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError(t("profile.errorAvatarInvalid"));
            return;
        }

        const url = URL.createObjectURL(file);
        setFormData((prev) => ({
            ...prev,
            avatar: url,
            avatarFile: file
        }));
        setSuccess(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleAvatarFileChange(file);
        }
        e.target.value = "";
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleSaveAll = async () => {
        setError(null);
        setSuccess(false);

        if (!user) {
            setError(t("profile.errorNotAuthenticated"));
            return;
        }

        try {
            setLoading(true);

            // Upload avatar if changed
            if (formData.avatarFile) {
                const updatedProfile = await userService.uploadAvatar(formData.avatarFile);
                setFormData(prev => ({ ...prev, avatar: updatedProfile.avatar || "", avatarFile: undefined }));
            } else if (formData.avatar && formData.avatar !== user.avatar && !formData.avatar.startsWith("blob:")) {
                await userService.updateUser(user.id, { avatar: formData.avatar });
            }

            // Update fullName if changed
            if (formData.fullName !== user.fullName) {
                await userService.updateUser(user.id, { fullName: formData.fullName });
            }

            // Update career/position
            await userService.updateJobInfo(user.id, {
                career: formData.career,
                position: formData.position,
            });

            // Refresh user data from server
            await refreshUser();

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Update failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <main className="profile-main">
                <div className="profile-container">
                    {/* Error/Success Messages */}
                    {error && (
                        <div className="profile-message error">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="profile-message success">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {t("profile.successMessage")}
                        </div>
                    )}

                    {/* Hero Avatar Card */}
                    <div className="profile-hero-card">
                        <div className="profile-hero">
                            <div
                                className="avatar-upload-zone"
                            >
                                <div className="avatar-wrapper">
                                    <div className="avatar-inner">
                                        <UserAvatar
                                            src={formData.avatar}
                                            name={user?.fullName || user?.email || "User"}
                                            size={100}
                                            className="avatar-image"
                                        />
                                    </div>
                                    <div className="avatar-overlay">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    className="avatar-file-input"
                                    aria-label="Upload avatar"
                                />
                            </div>
                            <div className="profile-user-info">
                                <h1 className="profile-user-name">{formData.fullName || user?.email?.split('@')[0] || "User"}</h1>
                                <p className="profile-user-email">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form Card */}
                    <div className="profile-form-card">
                        <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                            {/* Account Section */}
                            <div className="profile-section">
                                <div className="section-header">
                                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <h2 className="section-title">{t("profile.accountSection") || "Account"}</h2>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fullName" className="form-label">
                                        {t("profile.fullNameLabel") || "Full Name"}
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder={t("profile.fullNamePlaceholder") || "Enter your name"}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        {t("profile.emailLabel")}
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="form-input-readonly"
                                    />
                                </div>
                            </div>

                            {/* Career Section */}
                            <div className="profile-section">
                                <div className="section-header">
                                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                    <h2 className="section-title">{t("profile.careerSection") || "Career"}</h2>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="career" className="form-label">
                                        {t("profile.careerLabel")}
                                    </label>
                                    <textarea
                                        id="career"
                                        name="career"
                                        value={formData.career}
                                        onChange={handleInputChange}
                                        placeholder={t("profile.careerPlaceholder")}
                                        className="form-textarea"
                                        rows={2}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="position" className="form-label">
                                        {t("profile.positionLabel")}
                                    </label>
                                    <textarea
                                        id="position"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        placeholder={t("profile.positionPlaceholder")}
                                        className="form-textarea"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Save Button */}
                        <div className="profile-actions">
                            <button
                                type="button"
                                className="btn-save"
                                onClick={handleSaveAll}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        {t("profile.saving") || "Saving..."}
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        {t("profile.saveChanges") || "Save Changes"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
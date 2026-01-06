import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "~/services/api";
import "../styles/ProfilePage.css";
import UserAvatar from "../components/UserAvatar";

interface ProfileFormData {
    email: string;
    career: string;
    position: string;
    avatar: string;
    avatarFile?: File;
}



const ProfilePage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState<ProfileFormData>({
        email: "",
        career: "",
        position: "",
        avatar: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // ✅ KHÔNG gọi userService.getProfile() nữa (vì GET /users/profile đang 500)
    // Nếu cần lấy avatar hiện tại, thử lấy từ /users/me (thường ổn hơn)
    useEffect(() => {
        if (!user) return;

        const [career, position] = (user.jobTitle || "")
            .split(":::")
            .map((s) => s.trim());

        // Avatar: Prioritize backend, fallback to local storage (legacy)
        const avatarKey = `smart_exchange_avatar_${user.id}`;
        const savedAvatar = localStorage.getItem(avatarKey) || "";

        setFormData((prev) => ({
            ...prev,
            email: user.email,
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

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

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
    };

    // Update avatar (upload to S3 or update URL)
    const handleUpdateAvatar = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!user) {
            setError(t("profile.errorNotAuthenticated"));
            return;
        }

        try {
            setLoading(true);
            let newAvatarUrl = formData.avatar;

            if (formData.avatarFile) {
                // Upload to S3
                const updatedProfile = await userService.uploadAvatar(formData.avatarFile);
                newAvatarUrl = updatedProfile.avatar || "";
            } else if (formData.avatar !== user.avatar) {
                // Update URL manually
                await userService.updateUser(user.id, { avatar: formData.avatar });
            }

            // Update form data to show S3 URL instead of Blob
            setFormData(prev => ({ ...prev, avatar: newAvatarUrl, avatarFile: undefined }));

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            setError(String(err?.message || "Update failed"));
        } finally {
            setLoading(false);
        }
    };

    const handleBackToSettings = () => {
        navigate("/settings");
    };

    return (
        <div className="profile-page">
            <main className="profile-main">
                <div className="profile-container">
                    <h1 className="profile-title">{t("profile.title")}</h1>

                    {error && <div className="profile-error">{error}</div>}
                    {success && <div className="profile-success">{t("profile.successMessage")}</div>}

                    <form className="profile-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label-jp">
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

                        <div className="form-column-left">
                            {/* ===== Avatar Row ===== */}
                            <div className="form-item-row form-item-avatar">
                                <div className="form-group form-group-inline">
                                    <label htmlFor="avatar" className="form-label-jp">
                                        {t("profile.avatarLabel")}
                                    </label>

                                    <div className="avatar-controls">
                                        <div className="avatar-preview" aria-label="avatar-preview">
                                            <UserAvatar
                                                src={formData.avatar}
                                                name={user?.fullName || user?.email || "User"}
                                                size={72}
                                                className="avatar-image"
                                            />
                                        </div>

                                        <div className="avatar-inputs">


                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarFileChange}
                                                className="avatar-file-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn-update-individual"
                                    onClick={handleUpdateAvatar}
                                    disabled={loading}
                                >
                                    {loading ? t("profile.updating") : t("profile.updateButton")}
                                </button>
                            </div>

                            {/* Career Row */}
                            <div className="form-item-row">
                                <div className="form-group form-group-inline">
                                    <label htmlFor="career" className="form-label-jp">
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
                                <button
                                    type="button"
                                    className="btn-update-individual"
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        if (!user) {
                                            setError(t("profile.errorNotAuthenticated"));
                                            return;
                                        }
                                        try {
                                            setLoading(true);
                                            await userService.updateJobInfo(user.id, {
                                                career: formData.career,
                                                position: formData.position,
                                            });
                                            setSuccess(true);
                                            setTimeout(() => setSuccess(false), 2000);
                                        } catch {
                                            setError(t("profile.errorUpdateFailed"));
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    {t("profile.updateButton")}
                                </button>
                            </div>

                            {/* Position Row */}
                            <div className="form-item-row">
                                <div className="form-group form-group-inline">
                                    <label htmlFor="position" className="form-label-jp">
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
                                <button
                                    type="button"
                                    className="btn-update-individual"
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        if (!user) {
                                            setError(t("profile.errorNotAuthenticated"));
                                            return;
                                        }
                                        try {
                                            setLoading(true);
                                            await userService.updateJobInfo(user.id, {
                                                career: formData.career,
                                                position: formData.position,
                                            });
                                            setSuccess(true);
                                            setTimeout(() => setSuccess(false), 2000);
                                        } catch {
                                            setError(t("profile.errorUpdateFailed"));
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    {t("profile.updateButton")}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="profile-footer">
                        <button
                            type="button"
                            className="btn-settings-back"
                            onClick={handleBackToSettings}
                        >
                            {t("profile.settingsBackButton")}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
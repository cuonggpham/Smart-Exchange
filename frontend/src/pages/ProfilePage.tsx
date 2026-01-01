import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "~/services/api";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "../styles/ProfilePage.css";

interface ProfileFormData {
    email: string;
    career: string;
    position: string;
    avatar: string; // URL hoặc dataURL (base64 nhỏ)
}

/** Ước lượng bytes của dataURL */
const dataUrlSizeBytes = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1] || "";
    return Math.floor((base64.length * 3) / 4);
};

/** Nén ảnh -> dataURL JPEG nhỏ để gửi JSON (né 413) */
const compressAvatarToDataUrl = async (
    file: File,
    maxBytes: number,
    startSize = 256
): Promise<string> => {
    const loadImage = (f: File) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
            const url = URL.createObjectURL(f);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Image load failed"));
            };
            img.src = url;
        });

    const img = await loadImage(file);

    const sizes = [startSize, 224, 192, 160, 128];
    const qualities = [0.75, 0.7, 0.6, 0.5];

    for (const target of sizes) {
        const ratio = Math.min(target / img.width, target / img.height, 1);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");

        ctx.drawImage(img, 0, 0, w, h);

        for (const q of qualities) {
            const dataUrl = canvas.toDataURL("image/jpeg", q);
            if (dataUrlSizeBytes(dataUrl) <= maxBytes) return dataUrl;
        }
    }

    // fallback nhỏ nhất
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(img, 0, 0, 128, 128);
    return canvas.toDataURL("image/jpeg", 0.5);
};

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

        // Avatar: FE-only => lưu trong localStorage (backend hiện không hỗ trợ avatar)
        const avatarKey = `smart_exchange_avatar_${user.id}`;
        const savedAvatar = localStorage.getItem(avatarKey) || "";

        setFormData((prev) => ({
            ...prev,
            email: user.email,
            career: career || "",
            position: position || "",
            avatar: savedAvatar || prev.avatar || "",
        }));
    }, [user]);const isDataUrl = useMemo(() => formData.avatar.startsWith("data:image/"), [formData.avatar]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setSuccess(false);
    };

    const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // cho phép chọn lại cùng 1 file
        e.target.value = "";

        if (!file.type.startsWith("image/")) {
            setError(t("profile.errorAvatarInvalid"));
            return;
        }

        try {
            setError(null);
            setSuccess(false);

            // Bạn có thể chỉnh 80KB -> 50KB nếu backend limit nhỏ hơn
            const MAX_BYTES = 80 * 1024;

            const dataUrl = await compressAvatarToDataUrl(file, MAX_BYTES, 256);

            if (dataUrlSizeBytes(dataUrl) > MAX_BYTES) {
                setError("Avatar vẫn quá nặng. Hãy chọn ảnh nhỏ hơn.");
                return;
            }

            setFormData((prev) => ({ ...prev, avatar: dataUrl }));
        } catch {
            setError(t("profile.errorAvatarReadFailed"));
        }
    };

    // ✅ Update avatar bằng endpoint CÓ SẴN: PATCH /users/profile
    const handleUpdateAvatar = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!user) {
            setError(t("profile.errorNotAuthenticated"));
            return;
        }

        const nextAvatar = formData.avatar.trim();
        if (!nextAvatar) {
            setError("Bạn hãy chọn ảnh hoặc dán URL avatar trước.");
            return;
        }

        try {
            setLoading(true);

            // ✅ FE-only: backend hiện KHÔNG có field/endpoint avatar => lưu tạm trên trình duyệt
            const avatarKey = `smart_exchange_avatar_${user.id}`;
            localStorage.setItem(avatarKey, nextAvatar);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            setError(String(err?.message || "Lưu avatar thất bại."));
        } finally {
            setLoading(false);
        }
    };

    const handleBackToSettings = () => {
        navigate("/settings");
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="profile-app-name">Smart Exchange</div>
                <LanguageSwitcher />
            </header>

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
                                            {formData.avatar ? (
                                                <img
                                                    src={formData.avatar}
                                                    alt={t("profile.avatarAlt")}
                                                    className="avatar-image"
                                                />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {t("profile.avatarEmpty")}
                                                </div>
                                            )}
                                        </div>

                                        <div className="avatar-inputs">
                                            {/* Nếu là dataURL thì để trống ô input để khỏi hiện base64 dài */}
                                            <input
                                                id="avatar"
                                                name="avatar"
                                                type="text"
                                                value={isDataUrl ? "" : formData.avatar}
                                                onChange={handleInputChange}
                                                placeholder={t("profile.avatarUrlPlaceholder")}
                                                className="form-input"
                                            />
                                            {isDataUrl && (
                                                <small style={{ opacity: 0.7 }}>
                                                    Đã chọn ảnh từ file (đang nén)...
                                                </small>
                                            )}

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
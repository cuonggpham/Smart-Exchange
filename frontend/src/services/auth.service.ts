import { axiosInstance } from "./axios.config";

// --- Request Types ---
export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    jobTitle?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GoogleLoginRequest {
    token: string;
}

// --- Response Types ---
export interface UserInfo {
    id: string;
    email: string;
    jobTitle: string | null;
    // Quan trọng: dùng để kiểm tra xem user đã xem hướng dẫn chưa
    isTutorialCompleted: boolean; 
    // Các trường tùy chọn (giữ lại từ bản cũ để tương thích nếu cần)
    languageCode?: string;
    themeMode?: string;
    avatar?: string;

}

export interface UserSettings {
    language: string;
    theme: string;
}

export interface LoginResponse {
    user: UserInfo;
    settings: UserSettings;
}

export interface RegisterResponse {
    message: string;
    data: null;
}

// --- Service Class ---
class AuthService {
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        return axiosInstance.post("/auth/register", data);
    }

    async login(data: LoginRequest): Promise<LoginResponse> {
        return axiosInstance.post("/auth/login", data);
    }

    async loginWithGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
        return axiosInstance.post("/auth/google", data);
    }

    async logout(): Promise<{ message: string }> {
        return axiosInstance.post("/auth/logout");
    }

    /**
     * Refresh access token
     * LƯU Ý: Backend cần được cấu hình để đọc refresh_token từ cookie (req.cookies.refresh_token)
     * thay vì từ body, vì httpOnly cookie không thể đọc từ JavaScript
     */
    async refreshToken(): Promise<{ message: string }> {
        return axiosInstance.post("/auth/refresh", {});
    }
}

export const authService = new AuthService();
// Re-export all services for convenience
export { authService } from "./auth.service";
export { userService } from "./user.service";

// Re-export types
export type {
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    RegisterResponse,
    UserInfo,
    UserSettings,
    GoogleLoginRequest,
} from "./auth.service";

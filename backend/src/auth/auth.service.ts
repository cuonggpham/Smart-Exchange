import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { BcryptSecurity } from "~/common/security/bcrypt.security";
import { AppException } from "~/common/exceptions/app.exception";
import { ExceptionCode } from "~/common/constants/exception-code.constant";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { OAuth2Client } from "google-auth-library";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {
        this.googleClient = new OAuth2Client(this.configService.get<string>("GOOGLE_CLIENT_ID"));
    }

    async register(registerDto: RegisterDto) {
        await this.usersService.create(registerDto);
        return { message: "Registration successful" };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new AppException(ExceptionCode.USER_NOT_FOUND);
        }

        const isMatch = await BcryptSecurity.comparePassword(loginDto.password, user.password);
        if (!isMatch) {
            throw new AppException(ExceptionCode.INVALID_PASSWORD);
        }

        const payload = { user_id: user.userId, email: user.email };
        const token = this.jwtService.sign(payload, { expiresIn: "1h" });

        const refreshToken = this.jwtService.sign(
            { user_id: user.userId, type: "refresh" },
            {
                secret: process.env.REFRESH_JWT_SECRET,
                expiresIn: "30d",
            }
        );

        const { password, ...userWithoutPassword } = user;

        return {
            token,
            refreshToken,
            user: {
                id: userWithoutPassword.userId,
                email: userWithoutPassword.email,
                jobTitle: userWithoutPassword.jobTitle,
                // 👇 [QUAN TRỌNG] Thêm dòng này:
                isTutorialCompleted: userWithoutPassword.isTutorialCompleted,
            },
            settings: {
                language: userWithoutPassword.languageCode,
                theme: userWithoutPassword.themeMode,
            },
        };
    }

    // Logout method
    logout() {
        return {
            message: "Logout successful",
        };
    }

    // Refresh access token bằng JWT
    refreshAccessToken(refreshTokenDto: RefreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: process.env.REFRESH_JWT_SECRET,
            }) as { user_id: string; email: string; type: string };

            if (!payload || payload.type !== "refresh") {
                throw new AppException(ExceptionCode.UNAUTHORIZED, "Invalid token type");
            }

            const newAccessToken = this.jwtService.sign(
                { user_id: payload.user_id, email: payload.email },
                { expiresIn: "1h" }
            );

            const newRefreshToken = this.jwtService.sign(
                { user_id: payload.user_id, type: "refresh" },
                {
                    secret: process.env.REFRESH_JWT_SECRET,
                    expiresIn: "30d",
                }
            );

            return {
                token: newAccessToken,
                refreshToken: newRefreshToken,
            };
        } catch {
            throw new AppException(ExceptionCode.UNAUTHORIZED, "Invalid or expired refresh token");
        }
    }

    revokeRefreshToken() {
        return {
            message: "Refresh token revoked successfully",
        };
    }

    async loginWithGoogle(googleLoginDto: GoogleLoginDto) {
        try {
            // Sử dụng ID Token thay vì Access Token
            const ticket = await this.googleClient.verifyIdToken({
                idToken: googleLoginDto.token,
                audience: this.configService.get<string>("GOOGLE_CLIENT_ID"),
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new AppException(ExceptionCode.UNAUTHORIZED, "Invalid Google ID token");
            }

            const user = await this.usersService.upsertGoogleUser({
                email: payload.email,
                fullName: payload.name || payload.email.split("@")[0],
            });

            const token = this.jwtService.sign(
                { user_id: user.userId, email: user.email },
                { expiresIn: "1h" }
            );

            const refreshToken = this.jwtService.sign(
                { user_id: user.userId, type: "refresh" },
                {
                    secret: process.env.REFRESH_JWT_SECRET,
                    expiresIn: "30d",
                }
            );

            return {
                token,
                refreshToken,
                user: {
                    id: user.userId,
                    email: user.email,
                    jobTitle: user.jobTitle,
                    isTutorialCompleted: user.isTutorialCompleted,
                },
                settings: {
                    language: user.languageCode,
                    theme: user.themeMode,
                },
            };
        } catch (error) {
            console.error("Google Login Error:", error);
            if (error instanceof AppException) {
                throw error;
            }
            throw new AppException(
                ExceptionCode.UNAUTHORIZED,
                "Failed to authenticate with Google"
            );
        }
    }
}

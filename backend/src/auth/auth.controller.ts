import { Body, Controller, Post, UseGuards, Res, Req } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { setAuthCookie } from "~/common/helpers/cookie.helper";
import { AppException } from "../common/exceptions/app.exception";
import { ExceptionCode } from "../common/constants/exception-code.constant";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post("login")
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(loginDto);

        const jwtExpiration = parseInt(process.env.JWT_EXPIRATION || "3600", 10);

        setAuthCookie(res, result.token, result.refreshToken, jwtExpiration);

        return {
            user: result.user,
            settings: result.settings,
        };
    }

    @Post("logout")
    @UseGuards(JwtAuthGuard)
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return this.authService.logout();
    }

    @Post("google")
    async googleLogin(
        @Body() googleLoginDto: GoogleLoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.authService.loginWithGoogle(googleLoginDto);

        const jwtExpiration = parseInt(process.env.JWT_EXPIRATION || "3600", 10);

        setAuthCookie(res, result.token, result.refreshToken, jwtExpiration);

        return {
            user: result.user,
            settings: result.settings,
        };
    }

    // Refresh access token endpoint - đọc refresh_token từ cookie
    @Post("refresh")
    refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        
        if (!refreshToken) {
            throw new AppException(ExceptionCode.UNAUTHORIZED, "Refresh token not found in cookie");
        }

        const result = this.authService.refreshAccessToken({ refreshToken });

        const jwtExpiration = parseInt(process.env.JWT_EXPIRATION || "3600", 10);

        setAuthCookie(res, result.token, result.refreshToken, jwtExpiration);

        return {
            message: "Token refreshed successfully",
        };
    }

    // Revoke refresh token endpoint
    @Post("revoke")
    @UseGuards(JwtAuthGuard)
    revoke(@Res({ passthrough: true }) res: Response) {
        const result = this.authService.revokeRefreshToken();

        res.clearCookie("refresh_token");

        return result;
    }
}

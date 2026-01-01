import { Response } from "express";

export const setAuthCookie = (
    res: Response,
    accessToken: string,
    refreshToken: string,
    jwtExpiration: number
) => {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: jwtExpiration * 1000,
    });

    // Lưu refresh token vào cookie
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    });
};

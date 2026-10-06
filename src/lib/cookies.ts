import { CookieOptions, Response } from "express";
import crypto from "crypto";

const isProd = process.env.NODE_ENV === "production";

const baseOptions: CookieOptions = {
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
};

const ACCESS_MAX_AGE = 1000 * 60 * 15; // 15 min
const REFRESH_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
const REFRESH_PATH = "/api/auth/refresh";

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  res.cookie("accessToken", accessToken, {
    ...baseOptions,
    httpOnly: true,
    maxAge: ACCESS_MAX_AGE,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    httpOnly: true,
    maxAge: REFRESH_MAX_AGE,
    path: REFRESH_PATH, // only sent to the refresh endpoint
  });

  res.cookie("csrfToken", csrfToken, {
    ...baseOptions,
    httpOnly: false, // the client must be able to read it
    maxAge: REFRESH_MAX_AGE,
    path: "/",
  });

  return csrfToken;
}

export function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", { ...baseOptions, path: "/" });
  res.clearCookie("refreshToken", { ...baseOptions, path: REFRESH_PATH });
  res.clearCookie("csrfToken", { ...baseOptions, path: "/" });
}

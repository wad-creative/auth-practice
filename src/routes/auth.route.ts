import express from "express";
import { register } from "../controllers/auth/register.js";
import { verificationEmail } from "../controllers/auth/verificationEmail.js";
import { login } from "../controllers/auth/login.js";
import { refreshToken } from "../controllers/auth/refreshToken.js";
import { logout } from "../controllers/auth/logout.js";
import { forgetPassword } from "../controllers/auth/forgetPassword.js";
import { resetPassword } from "../controllers/auth/resetPassword.js";
import {
  googleAuthCallback,
  googleAuthStart,
} from "../controllers/auth/getGoogleClient.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { twoFactorAuthSetup } from "../controllers/auth/2FaAuthSetup.js";
import { twoFaAuthVerify } from "../controllers/auth/2FaAuthVerify.js";
import { verifyCsrf } from "../lib/verifyCsrf.js";
import {
  loginLimiter,
  loginAccountLimiter,
  emailActionLimiter,
  sessionLimiter,
  oauthLimiter,
} from "../middleware/rateLimiters.js";

const route = express.Router();

// Public routes
route.post("/register", emailActionLimiter, register);
route.get("/verify-email", verificationEmail);
route.post("/login", loginLimiter, loginAccountLimiter, login);
route.post("/forget-password", emailActionLimiter, forgetPassword);
route.post("/reset-password", emailActionLimiter, resetPassword);
route.get("/google", oauthLimiter, googleAuthStart);
route.get("/google/callback", oauthLimiter, googleAuthCallback);

// Session routes
route.post("/refresh", sessionLimiter, verifyCsrf, refreshToken);
route.post("/logout", verifyCsrf, logout);
route.post(
  "/2fa/setup",
  sessionLimiter,
  verifyCsrf,
  requireAuth,
  twoFactorAuthSetup,
);
route.post(
  "/2fa/verify",
  sessionLimiter,
  verifyCsrf,
  requireAuth,
  twoFaAuthVerify,
);

export default route;

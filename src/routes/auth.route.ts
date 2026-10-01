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

const route = express.Router();

route.post("/register", register);
route.get("/verify-email", verificationEmail);
route.post("/login", login);
route.post("/refresh-token", refreshToken);
route.post("/logout", logout);
route.post("/forget-password", forgetPassword);
route.post("/reset-password", resetPassword);
route.get("/google", googleAuthStart);
route.get("/google/callback", googleAuthCallback);
route.post("/2fa/setup", requireAuth, twoFactorAuthSetup);
route.post("/2fa/verify", requireAuth, twoFaAuthVerify);

export default route;

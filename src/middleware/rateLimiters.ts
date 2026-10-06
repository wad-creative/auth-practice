import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request } from "express";

const minutes = (n: number) => n * 60 * 1000;

// Helper: build a key from IP + email so one attacker can't hammer one account
function ipAndEmailKey(req: Request) {
  const email = String(req.body?.email ?? "")
    .toLowerCase()
    .trim();
  return `${ipKeyGenerator(req.ip as string)}:${email}`;
}

// Global safety net for the whole API
export const globalLimiter = rateLimit({
  windowMs: minutes(10),
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Login: strict, counts only FAILED attempts
export const loginLimiter = rateLimit({
  windowMs: minutes(5),
  limit: 5,
  keyGenerator: ipAndEmailKey,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
});

// Per-account limit: stops attackers who rotate IPs
export const loginAccountLimiter = rateLimit({
  windowMs: minutes(10),
  limit: 10,
  keyGenerator: (req) =>
    String(req.body?.email ?? "")
      .toLowerCase()
      .trim() || ipKeyGenerator(req.ip as string),
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts on this account. Try again later." },
});

// Register, forget-password, reset-password: block email bombing
export const emailActionLimiter = rateLimit({
  windowMs: minutes(10),
  limit: 5,
  keyGenerator: ipAndEmailKey,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in an hour." },
});

// Refresh / 2FA setup / 2FA verify: logged-in routes, per IP
export const sessionLimiter = rateLimit({
  windowMs: minutes(10),
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please slow down." },
});

// Google OAuth routes: light limit
export const oauthLimiter = rateLimit({
  windowMs: minutes(5),
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

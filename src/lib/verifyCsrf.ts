import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function verifyCsrf(req: Request, res: Response, next: NextFunction) {
  // Safe methods must never change data, so they don't need protection
  if (SAFE_METHODS.includes(req.method)) return next();

  const cookieToken = req.cookies?.csrfToken as string | undefined;
  const headerToken = req.get("x-csrf-token");

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ message: "CSRF token missing" });
  }

  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);

  // timingSafeEqual throws if lengths differ, so check first
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
}

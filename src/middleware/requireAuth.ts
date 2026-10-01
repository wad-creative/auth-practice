import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/token";
import { User } from "../models/user";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "You're not authorized, please login" });
    }

    const token = header.split(" ")[1];

    const payload = verifyAccessToken(token) as {
      userId: string;
      role: string;
      tokenVersion: number;
    };

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const authReq = req as any;
    authReq.user = {
      userId: payload.userId,
      name: user.name,
      email: user.email,
      role: payload.role,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "unexpected error" });
  }
}

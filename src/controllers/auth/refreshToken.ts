import { Request, Response } from "express";
import { User } from "../../models/user";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../../lib/token";

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      return res.status(401).json({ message: "No refresh token found" });
    }

    // Verify the refresh token
    const payload = verifyRefreshToken(token) as {
      userId: string;
      tokenVersion: number;
    };

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if token version is the same
    if (payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate a new access token
    const newAccessToken = createAccessToken({
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // Generate a new refresh token
    const newRefreshToken = createRefreshToken({
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion,
    });

    // Save the new refresh token in Cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return the access token
    res.status(200).json({
      accessToken: newAccessToken,
      id: user._id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

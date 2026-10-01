import { Request, Response } from "express";
import { loginSchema } from "../../schema/login.schema.js";
import { User } from "../../models/user.js";
import { comparePassword } from "../../lib/comparePassword.js";
import { createAccessToken, createRefreshToken } from "../../lib/token.js";
import { verify } from "otplib";

export async function login(req: Request, res: Response) {
  try {
    // Check if data is valid
    const result = loginSchema.safeParse(req.body);

    // Display errors messages
    if (!result.success) {
      return res.status(400).json(result.error.issues);
    }

    const { email, password, twoFactorCode } = result.data;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has 2FA enabled
    if (user.twoFactorEnabled) {
      // Check if 2FA code is correct
      if (!twoFactorCode || typeof twoFactorCode !== "string") {
        return res.status(401).json({ message: "2FA code is required" });
      }

      if (!user.twoFactorSecret) {
        return res.status(401).json({ message: "2FA is not enabled" });
      }
    }

    // Verify the code using optlib
    const isValidCode = await verify({
      secret: user.twoFactorSecret as string,
      token: twoFactorCode as string,
    });

    if (!isValidCode.valid) {
      return res.status(401).json({ message: "Invalid 2FA code" });
    }

    // Check if password is correct
    const verifyPassword = await comparePassword(password, user.password);
    if (!verifyPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in.",
      });
    }

    // import accessToken
    const accessToken = createAccessToken({
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // import refreshToken
    const refreshToken = createRefreshToken({
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion,
    });

    // Save refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "Login successfully",
      accessToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

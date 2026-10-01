import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { User } from "../../models/user";
import { createAccessToken, createRefreshToken } from "../../lib/token";
import crypto from "crypto";
import generateUnusablePasswordHash from "../../lib/generateUnusableCode";

// Get google client
function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables",
    );
  }
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

const STATE_COOKIE = "google_auth_state";

// Start google auth
export async function googleAuthStart(_req: Request, res: Response) {
  try {
    const client = getGoogleClient();

    const state = crypto.randomBytes(32).toString("hex");
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    const url = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      state,
    });

    return res.redirect(url);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// Check if two strings are equal
function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

// Google auth callback
export async function googleAuthCallback(req: Request, res: Response) {
  try {
    const returnedState = req.query.state;
    const savedState = req.cookies?.[STATE_COOKIE];

    // One-time use: clear it whatever happens next
    res.clearCookie(STATE_COOKIE);

    if (
      typeof returnedState !== "string" ||
      typeof savedState !== "string" ||
      !safeEqual(returnedState, savedState)
    ) {
      return res.status(400).json({ message: "Invalid state" });
    }

    // If the user click on cancel, redirect to login
    if (typeof req.query.error === "string") {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_cancelled`,
      );
    }

    // Extract the code from the query parameters
    const code = req.query.code;

    if (typeof code !== "string" || !code) {
      return res.status(400).json({ message: "No code provided" });
    }

    // Get google client
    const client = getGoogleClient();

    // Get tokens from code
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      return res.status(400).json({ message: "No id_token in tokens" });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    // Get payload from ticket
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: "No payload in ticket" });
    }

    // Get email from payload
    const email = payload.email;
    const emailVerified = payload.email_verified;
    if (!email || !emailVerified) {
      return res
        .status(400)
        .json({ message: "Email missing or not verified by Google" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find or create user
    let user = await User.findOne({ email: normalizedEmail });

    // if the user exist for his email is not verified
    if (user && !user.isEmailVerified) {
      user.isEmailVerified = true;
      user.password = await generateUnusablePasswordHash();
      user.tokenVersion += 1;
      await user.save();
    }

    if (!user) {
      user = await User.create({
        name: payload.name ?? normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: await generateUnusablePasswordHash(),
        isEmailVerified: true,
      });
    }

    // Create access token
    const accessToken = createAccessToken({
      userId: user._id.toString(),
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // Create refresh token
    const refreshToken = createRefreshToken({
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion,
    });

    // Set cookies for refresh token in the browser
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send response
    res.redirect(`${process.env.CLIENT_URL}/auth/callback`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

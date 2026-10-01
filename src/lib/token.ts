import jwt from "jsonwebtoken";

type payloadType = {
  userId: string;
  role?: "user" | "admin";
  tokenVersion: number;
};

// Create access token
export function createAccessToken({ userId, role, tokenVersion }: payloadType) {
  const payload = { userId, role, tokenVersion };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });
}

// Create refresh token
export function createRefreshToken({ userId, tokenVersion }: payloadType) {
  const payload = { userId, tokenVersion };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
}

// Verify refresh token
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as payloadType;
}

// Verify access token
export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as payloadType;
}

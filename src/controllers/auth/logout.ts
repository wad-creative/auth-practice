import { Request, Response } from "express";

export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie("refreshToken", { path: "/" });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
    console.log(error);
  }
}

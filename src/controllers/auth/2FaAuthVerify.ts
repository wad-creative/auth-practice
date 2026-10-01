import { Request, Response } from "express";
import { User } from "../../models/user";
import { verify } from "otplib";

export async function twoFaAuthVerify(req: Request, res: Response) {
  try {
    const authReq = req as any;
    const authUser = authReq.user;

    if (!authUser) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    const { code } = (req.body ?? {}) as { code?: string };
    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    const user = await User.findById(authUser.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.twoFactorSecret) {
      return res.status(401).json({ message: "2FA secret is not not found" });
    }

    const result = await verify({
      secret: user.twoFactorSecret,
      token: code,
    });

    if (!result.valid) {
      return res.status(401).json({ message: "Invalid 2FA code" });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({ message: "2FA enabled successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

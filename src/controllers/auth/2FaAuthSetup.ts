import { Request, Response } from "express";
import { User } from "../../models/user";
import { generateSecret, generateURI } from "otplib";

export async function twoFactorAuthSetup(req: Request, res: Response) {
  try {
    const authReq = req as any;
    const authUser = authReq.user;

    if (!authUser) {
      return res.status(401).json({ message: "You are not logged in" });
    }

    const user = await User.findById(authUser.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = generateSecret();

    const issuer = "auth-practice";

    const optAuthURL = generateURI({
      secret: secret,
      label: authUser.email,
      issuer: issuer,
    });

    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false;

    await user.save();

    res
      .status(200)
      .json({ message: "2FA setup successfully", optAuthURL, secret });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

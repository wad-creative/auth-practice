import { Request, Response } from "express";
import { User } from "../../models/user";
import { baseUrl } from "../../lib/baseUrl";
import { SendEmail } from "../../lib/SendEmail";
import jwt from "jsonwebtoken";

export async function forgetPassword(req: Request, res: Response) {
  try {
    const { email } = req.body as { email: string };
    const normalizeEmail = email.toLowerCase().trim();
    if (!normalizeEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizeEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a fresh token
    const verifyToken = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1d" },
    );

    user.resetPasswordToken = verifyToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send new email
    const verifyUrl = `${baseUrl}/auth/reset-password?token=${verifyToken}`;
    await SendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verifyUrl}">here</a> to reset your password</p>`,
    });

    return res
      .status(200)
      .json({ message: "Check your email to reset your password" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../models/user.js";
import { baseUrl } from "../../lib/baseUrl.js";
import { SendEmail } from "../../lib/SendEmail.js";

export async function resendVerificationEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If already verified, no need to resend
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate a fresh token
    const verifyToken = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1d" },
    );

    // Send new email
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${verifyToken}`;
    await SendEmail({
      to: user.email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email</p>`,
    });

    return res
      .status(200)
      .json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

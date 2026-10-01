import { Request, Response } from "express";
import { User } from "../../models/user";
import jwt from "jsonwebtoken";
import { hashPassword } from "../../lib/hashPassword";

export async function resetPassword(req: Request, res: Response) {
  try {
    const token = req.query.token as string | undefined;
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      id: string;
    };
    if (!payload) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Find the user by id
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if token is expired
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: "Token has expired" });
    }

    // Update the user's password
    const { password } = req.body as { password: string };
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword?.toString() || "";
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Reset password failed" });
  }
}

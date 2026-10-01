import { Request, Response } from "express";
import { User } from "../../models/user.js";
import jwt from "jsonwebtoken";

export async function verificationEmail(req: Request, res: Response) {
  try {
    // Extract the token from the query parameters
    const token = req.query.token as string | undefined;
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      id: string;
    };

    // Find the user by id
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Update the user's email verification status
    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error verifying email" });
  }
}

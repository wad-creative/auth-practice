import { Request, Response } from "express";
import { registerSchema } from "../../schema/register.schema.js";
import { User } from "../../models/user.js";
import { hashPassword } from "../../lib/hashPassword.js";
import jwt from "jsonwebtoken";
import { SendEmail } from "../../lib/SendEmail.js";
import { baseUrl } from "../../lib/baseUrl.js";

export async function register(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);

    // Check if data is valid
    if (!result.success) {
      return res.status(400).json(result.error.issues);
    }

    const { name, email, password } = result.data;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "This email already exists, use another one" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Create verification token
    const verifyToken = jwt.sign(
      {
        id: newUser._id,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    await newUser.save();

    // URL to verify email
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${verifyToken}`;

    // Send email
    await SendEmail({
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email</p>`,
    });

    // Before verifying email
    res.status(201).json({
      message:
        "User created successfully, please check your email to verify your account",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

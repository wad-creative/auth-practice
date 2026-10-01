import { Request, Response } from "express";

export async function profile(req: Request, res: Response) {
  try {
    const authReq = req as any;
    const authUser = authReq.user;

    res.status(200).json({
      user: authUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

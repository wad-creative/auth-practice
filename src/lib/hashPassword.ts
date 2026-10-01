import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}

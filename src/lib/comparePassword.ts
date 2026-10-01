import bcrypt from "bcryptjs";

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hashedPassword);

  return isMatch;
}

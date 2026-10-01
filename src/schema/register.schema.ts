import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(3),
  password: z.string().min(6),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

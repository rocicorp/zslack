import { z } from "zod";

export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const authDataSchema = z.object({
  session: sessionSchema,
  user: userSchema,
});

export type Session = z.infer<typeof sessionSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthData = z.infer<typeof authDataSchema>;

import { expo } from "@better-auth/expo";
import { drizzleSchema } from "@hello-zero-expo/shared/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  plugins: [expo()],
  database: drizzleAdapter(db, {
    schema: drizzleSchema,
    provider: "pg",
    usePlural: true,
  }),
  trustedOrigins: [
    "hello-zero-expo://",
    "http://localhost:8081",

  ],
  emailAndPassword: {
    enabled: true,
  },
});

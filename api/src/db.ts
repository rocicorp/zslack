import { getDb } from "@hello-zero-expo/shared/db";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const db = getDb({
  connectionString: process.env.DATABASE_URL,
});

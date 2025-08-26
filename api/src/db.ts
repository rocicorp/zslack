import { getDb } from "@hello-zero-expo/shared/db";

if (!process.env.ZERO_UPSTREAM_DB) {
  throw new Error("ZERO_UPSTREAM_DB is not set");
}

export const db = getDb({
  connectionString: process.env.ZERO_UPSTREAM_DB,
});

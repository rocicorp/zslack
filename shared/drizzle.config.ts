import { defineConfig } from "drizzle-kit";

if (!process.env.ZERO_UPSTREAM_DB) {
  throw new Error("ZERO_UPSTREAM_DB is not set");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "../migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.ZERO_UPSTREAM_DB,
  },
});

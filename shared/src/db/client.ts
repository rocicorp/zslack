import { zeroDrizzle } from "@rocicorp/zero/server/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema as zeroSchema } from "../zero-schema.gen";
import * as drizzleSchema from "./schema";

export const getDb = ({ connectionString }: { connectionString: string }) => {
  const pool = new Pool({ connectionString, max: 5 });
  return drizzle(pool, {
    schema: drizzleSchema,
  });
};

export const getZeroDb = (db: ReturnType<typeof getDb>) => {
  return zeroDrizzle(zeroSchema, db);
};

// Register the database provider for type safety
declare module "@rocicorp/zero" {
  interface DefaultTypes {
    dbProvider: ReturnType<typeof getZeroDb>;
  }
}

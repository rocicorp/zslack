import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const getDb = ({ connectionString }: { connectionString: string }) => {
  const pool = new Pool({ connectionString, max: 5 });
  return drizzle(pool, {
    schema,
  });
};

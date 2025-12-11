import {
  type ReadonlyJSONValue,
  type ServerTransaction,
  withValidation,
} from "@rocicorp/zero";
import { handleGetQueriesRequest, PushProcessor } from "@rocicorp/zero/server";
import {
  type DrizzleTransaction,
  zeroDrizzle,
} from "@rocicorp/zero/server/adapters/drizzle";
import {
  createMutators as createMutatorsShared,
  isLoggedIn,
  type Mutators,
  queries,
  schema,
  type Schema,
} from "@zslack/shared";
import type { AuthData } from "@zslack/shared/auth";
import { auditLogs } from "@zslack/shared/db";
import crypto from "node:crypto";
import { db } from "./db";
import { getHono } from "./hono";

type ServerTx = ServerTransaction<Schema, DrizzleTransaction<typeof db>>;

const processor = new PushProcessor(zeroDrizzle(schema, db));

const createMutators = (authData: AuthData | null) => {
  const mutators = createMutatorsShared(authData);

  return {
    ...mutators,
    message: {
      ...mutators.message,
      async sendMessage(tx: ServerTx, params) {
        isLoggedIn(authData);

        await mutators.message.sendMessage(tx, params);

        // we can use the db tx to insert server-only data, like audit logs
        await tx.dbTransaction.wrappedTransaction.insert(auditLogs).values({
          id: crypto.randomUUID(),
          userId: authData.user.id,
          action: "sendMessage",
        });
      },
    },
  } as const satisfies Mutators;
};

const zero = getHono()
  .post("/mutate", async (c) => {
    // get the auth data from betterauth
    const authData = c.get("auth");

    const result = await processor.process(createMutators(authData), c.req.raw);

    return c.json(result);
  })
  .post("/get-queries", async (c) => {
    // get the auth data from betterauth
    const authData = c.get("auth");

    const result = await handleGetQueriesRequest(
      (name, args) => ({ query: getQuery(authData, name, args) }),
      schema,
      c.req.raw
    );

    return c.json(result);
  });

const validatedQueries = Object.fromEntries(
  Object.values(queries).map((q) => [q.queryName, withValidation(q)])
);

function getQuery(
  authData: AuthData | null,
  name: string,
  args: readonly ReadonlyJSONValue[]
) {
  if (name in validatedQueries) {
    const q = validatedQueries[name];
    return q(authData, ...args);
  }
  throw new Error(`Unknown query: ${name}`);
}

export { zero };

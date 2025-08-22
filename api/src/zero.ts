import {
  createMutators as createMutatorsShared,
  isLoggedIn,
  type Mutators,
  queries,
  schema,
  type Schema,
} from "@hello-zero-expo/shared";
import type { AuthData } from "@hello-zero-expo/shared/auth";
import { auditLogs } from "@hello-zero-expo/shared/db";
import {
  type AnyQuery,
  type ReadonlyJSONValue,
  type ServerTransaction,
} from "@rocicorp/zero";
import {
  handleGetQueriesRequest,
  PushProcessor,
  ZQLDatabase,
} from "@rocicorp/zero/server";
import {
  NodePgConnection,
  type NodePgZeroTransaction,
} from "drizzle-zero/node-postgres";
import crypto from "node:crypto";
import { db } from "./db";
import { getHono } from "./hono";

type ServerTx = ServerTransaction<Schema, NodePgZeroTransaction<typeof db>>;

const processor = new PushProcessor(
  new ZQLDatabase(new NodePgConnection(db), schema)
);

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

function isQuery(key: string): key is keyof typeof queries {
  return key in queries;
}

function getQuery(
  context: AuthData | null,
  name: string,
  args: readonly ReadonlyJSONValue[]
) {
  let query;
  if (isQuery(name)) {
    query = (
      queries[name] as (
        context: AuthData | null,
        ...args: readonly ReadonlyJSONValue[]
      ) => AnyQuery
    )(context, ...args);
  } else {
    throw new Error(`Unknown query: ${name}`);
  }

  return query;
}

export { zero };

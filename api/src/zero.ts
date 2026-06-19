import {
  defineMutator,
  defineMutators,
  mustGetMutator,
  mustGetQuery,
} from "@rocicorp/zero";
import { handleMutateRequest, handleQueryRequest } from "@rocicorp/zero/server";
import { isLoggedIn, mutators, queries, schema } from "@zslack/shared";
import { auditLogs, getZeroDb } from "@zslack/shared/db";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import { getHono } from "./hono";

const dbProvider = getZeroDb(db);

const serverMutators = defineMutators(mutators, {
  message: {
    sendMessage: defineMutator(
      z.object({
        id: z.string(),
        channelId: z.string(),
        body: z.string(),
        createdAt: z.number(),
      }),
      async ({ tx, args, ctx }) => {
        isLoggedIn(ctx);

        await mutators.message.sendMessage.fn({ tx, args, ctx });

        if (tx.location === "server") {
          // we can use the db tx to insert server-only data, like audit logs
          await tx.dbTransaction.wrappedTransaction.insert(auditLogs).values({
            id: crypto.randomUUID(),
            userId: ctx.user.id,
            action: "sendMessage",
          });
        }
      },
    ),
  },
});

const zero = getHono()
  .post("/mutate", async (c) => {
    // get the auth data from betterauth
    const authData = c.get("auth");

    const result = await handleMutateRequest({
      dbProvider,
      handler: async (transact) =>
        await transact(async (tx, name, args) => {
          const mutator = mustGetMutator(serverMutators, name);
          return mutator.fn({
            args,
            tx,
            ctx: authData,
          });
        }),
      request: c.req.raw,
      userID: authData?.user.id ?? null,
    });

    return c.json(result);
  })
  .post("/query", async (c) => {
    // get the auth data from betterauth
    const authData = c.get("auth");

    const result = await handleQueryRequest({
      handler: (name, args) => {
        const query = mustGetQuery(queries, name);
        return query.fn({ args, ctx: authData });
      },
      schema,
      request: c.req.raw,
      userID: authData?.user.id ?? null,
    });

    return c.json(result);
  });

export { zero };

import { defineQueries, defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "./zero-schema.gen";
import { isLoggedIn } from "./zql";

export const queries = defineQueries({
  allChannels: defineQuery(z.undefined(), () =>
    zql.channels
      .orderBy("createdAt", "desc")
      .related("messages", (q) => q.orderBy("createdAt", "desc").limit(5000))
      .limit(10),
  ),

  channelWithMessages: defineQuery(z.string(), ({ ctx, args }) => {
    isLoggedIn(ctx);

    return zql.channels
      .where("id", "=", args as string)
      .related("messages", (q) =>
        q.related("sender").orderBy("createdAt", "desc"),
      )
      .orderBy("createdAt", "desc")
      .limit(5000)
      .one();
  }),
});

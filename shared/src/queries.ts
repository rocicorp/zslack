import { defineQuery, defineQueryWithContextType } from "@rocicorp/zero";
import { z } from "zod";
import { type AuthData } from "./auth";
import { builder } from "./zero-schema.gen";
import { isLoggedIn } from "./zql";

const defineAuthQuery = defineQueryWithContextType<AuthData | null>();

export const queries = {
  allChannels: defineQuery(
    "allChannels",
    {
      validator: z.any(),
    },
    () =>
      builder.channels
        .orderBy("createdAt", "desc")
        .related("messages", (q) => q.orderBy("createdAt", "desc").limit(5000))
        .limit(10)
  ),

  channelWithMessages: defineAuthQuery(
    "channelWithMessages",
    { validator: z.string() },
    ({ ctx, args }) => {
      isLoggedIn(ctx);

      return builder.channels
        .where("id", "=", args as string)
        .related("messages", (q) =>
          q.related("sender").orderBy("createdAt", "desc")
        )
        .orderBy("createdAt", "desc")
        .limit(5000)
        .one();
    }
  ),
};

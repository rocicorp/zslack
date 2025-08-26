import { syncedQuery, syncedQueryWithContext } from "@rocicorp/zero";
import { z } from "zod";
import { type AuthData } from "./auth";
import { builder } from "./zero-schema.gen";
import { isLoggedIn } from "./zql";

export const queries = {
  allChannels: syncedQuery("allChannels", z.tuple([]), () => {
    return builder.channels;
  }),

  channelWithMessages: syncedQueryWithContext(
    "channelWithMessages",
    z.tuple([z.string()]),
    (authData: AuthData | null, id) => {
      isLoggedIn(authData);

      return builder.channels
        .where("id", "=", id)
        .related("messages", (q) =>
          q.related("sender").orderBy("createdAt", "desc")
        )
        .one();
    }
  ),
};

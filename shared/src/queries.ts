import { syncedQueryWithContext } from "@rocicorp/zero";
import type { AuthData } from "./auth";
import { builder } from "./zero-schema.gen";
import { isLoggedIn } from "./zql";

export const queries = {
  currentUser: syncedQueryWithContext(
    "currentUser",
    (authData: AuthData | null) => {
      return builder.users
        .where("id", "=", authData?.user.id ?? "__not_logged_in__")
        .one();
    }
  ),

  allChannels: syncedQueryWithContext(
    "allChannels",
    (_authData: AuthData | null) => {
      return builder.channels;
    }
  ),

  channelWithMessages: syncedQueryWithContext(
    "channelWithMessages",
    (authData: AuthData | null, id: string) => {
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

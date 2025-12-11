import { defineMutator, defineMutators } from "@rocicorp/zero";
import { z } from "zod";
import { isLoggedIn } from "./zql";

export const mutators = defineMutators({
  message: {
    sendMessage: defineMutator(
      z.object({
        id: z.string(),
        channelId: z.string(),
        body: z.string(),
        createdAt: z.number(),
      }),
      async ({ tx, args: { id, channelId, body, createdAt }, ctx }) => {
        isLoggedIn(ctx);

        await tx.mutate.messages.insert({
          id,
          createdAt,
          updatedAt: createdAt,
          channelID: channelId,
          body,
          senderID: ctx.user.id,
        });
      }
    ),
  },
});

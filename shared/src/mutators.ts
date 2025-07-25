import type { Schema } from "@hello-zero-expo/shared";
import type { Transaction } from "@rocicorp/zero";
import type { AuthData } from "./auth";
import { isLoggedIn } from "./zql";

type Tx = Transaction<Schema>;

export function createMutators(authData: AuthData | null) {
  return {
    message: {
      async sendMessage(
        tx: Tx,
        {
          id,
          channelId,
          body,
          createdAt, 
        }: {
          id: string;
          createdAt: number;
          channelId: string;
          body: string;
        }
      ) {
        isLoggedIn(authData);

        await tx.mutate.messages.insert({
          id,
          createdAt,
          updatedAt: createdAt,
          channelID: channelId,
          body,
          senderID: authData.user.id,
        });
      },
    },
  } as const;
}

export type Mutators = ReturnType<typeof createMutators>;

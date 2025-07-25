import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "https://macbook.cormo-turtle.ts.net:3000",
  plugins: [
    expoClient({
      scheme: "hello-zero-expo",
      storagePrefix: "hello-zero-expo",
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { config } from "./config";

export const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins:
    // on web, we use the browser's storage
    Platform.OS === "web"
      ? []
      : [
          expoClient({
            scheme: "zslack",
            storagePrefix: "zslack",
            storage: SecureStore,
          }),
        ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

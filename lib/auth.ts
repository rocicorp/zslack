import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const authClient = createAuthClient({
  // 3000 is the default port for the API server
  // but localhost is not supported in android
  // you need to change it to your API server's IP address
  baseURL: "http://localhost:3000",
  plugins:
    // on web, we use the browser's storage
    Platform.OS === "web"
      ? []
      : [
          expoClient({
            scheme: "hello-zero-expo",
            storagePrefix: "hello-zero-expo",
            storage: SecureStore,
          }),
        ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

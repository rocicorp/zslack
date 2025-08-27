import { authClient, useSession } from "@/lib/auth";
import type { ZeroOptions } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { expoSQLiteStoreProvider } from "@rocicorp/zero/react-native";
import {
  createMutators,
  type Mutators,
  schema,
  type Schema,
} from "@zlack/shared";
import { authDataSchema } from "@zlack/shared/auth";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// on web, we use the browser's IndexedDB
const kvStore = Platform.OS === "web" ? undefined : expoSQLiteStoreProvider();

// on web, we don't need to pass the auth cookie, since this is handled by the browser
const auth = Platform.OS === "web" ? undefined : authClient.getCookie();

export default function RootLayout() {
  const { data: session } = useSession();

  const authData = useMemo(() => {
    const result = authDataSchema.safeParse(session);
    return result.success ? result.data : null;
  }, [session]);

  const zeroProps = useMemo(() => {
    return {
      storageKey: "zlack",
      kvStore,
      // 4848 is the default port for the zero server
      // but localhost is not supported in android
      // you need to change it to your API server's IP address
      server: "https://macbook.cormo-turtle.ts.net:4848",
      userID: authData?.user.id ?? "anon",
      schema,
      mutators: createMutators(authData),
      auth,
      enableLegacyMutators: false,
      enableLegacyQueries: false,
    } as const satisfies ZeroOptions<Schema, Mutators>;
  }, [authData]);

  return (
    <ZeroProvider {...zeroProps}>
      <SafeAreaProvider>
        <StatusBar style={Platform.OS === "ios" ? "dark" : "light"} />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: "600" },
            headerTitleAlign: "center",
            contentStyle: { backgroundColor: "#fff" },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Channels" }} />
          <Stack.Screen
            name="channel/[id]"
            options={{ title: "Channel", headerBackTitle: "Back" }}
          />
        </Stack>
      </SafeAreaProvider>
    </ZeroProvider>
  );
}

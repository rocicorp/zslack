import { authClient, useSession } from "@/lib/auth";
import type { ZeroOptions } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { expoSQLiteStoreProvider } from "@rocicorp/zero/react-native";
import {
  createMutators,
  type Mutators,
  schema,
  type Schema,
} from "@zslack/shared";
import { authDataSchema } from "@zslack/shared/auth";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// on web, we use the browser's IndexedDB
const kvStore = Platform.OS === "web" ? undefined : expoSQLiteStoreProvider();

export default function RootLayout() {
  const { data: session, isPending } = useSession();

  const authData = useMemo(() => {
    const result = authDataSchema.safeParse(session);
    return result.success ? result.data : null;
  }, [session]);

  const cookie = useMemo(() => {
    const ck = Platform.OS === "web" ? undefined : authClient.getCookie();
    return ck ? ck : undefined;
    // we force a re-render when the session changes, since getCookie is
    // not reactive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending]);

  const zeroProps = useMemo(() => {
    return {
      storageKey: "zslack",
      kvStore,
      // 4848 is the default port for the zero server
      // but localhost is not supported in android
      // you need to change it to your API server's IP address
      server: "http://localhost:4848",
      userID: authData?.user.id ?? "anon",
      schema,
      mutators: createMutators(authData),
      auth: cookie,
      enableLegacyMutators: false,
      enableLegacyQueries: false,
    } as const satisfies ZeroOptions<Schema, Mutators>;
  }, [authData, cookie]);

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

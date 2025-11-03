import { authClient, useSession } from "@/lib/auth";
import { config } from "@/lib/config";
import type { ZeroOptions } from "@rocicorp/zero";
import { expoSQLiteStoreProvider } from "@rocicorp/zero/expo-sqlite";
import { ZeroProvider } from "@rocicorp/zero/react";
import {
  createMutators,
  type Mutators,
  schema,
  type Schema,
} from "@zslack/shared";
import { authDataSchema } from "@zslack/shared/auth";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [kvStore, setKvStore] = useState<
    ReturnType<typeof expoSQLiteStoreProvider> | "idb" | undefined
  >(Platform.OS === "web" ? "idb" : undefined);
  const { data: session, isPending } = useSession();

  // initialize kvStore after mount to avoid
  // TurboModule crash with New Architecture
  useEffect(() => {
    if (Platform.OS !== "web") {
      setKvStore(expoSQLiteStoreProvider());
    }
  }, []);

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
    if (!kvStore) {
      return null;
    }
    return {
      storageKey: "zslack",
      kvStore,
      server: config.zeroCacheUrl,
      userID: authData?.user.id ?? "anon",
      schema,
      mutators: createMutators(authData),
      auth: cookie,
    } as const satisfies ZeroOptions<Schema, Mutators>;
  }, [authData, cookie, kvStore]);

  // show loading state until kvStore is ready
  if (!zeroProps) {
    return null;
  }

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

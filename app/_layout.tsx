import { authClient, useSession } from "@/lib/auth";
import { config } from "@/lib/config";
import { storageProvider } from "@/lib/storage";
import type { ZeroOptions } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import {
  createMutators,
  schema,
  type Mutators,
  type Schema,
} from "@zslack/shared";
import { authDataSchema } from "@zslack/shared/auth";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
      kvStore: storageProvider(),
      server: config.zeroCacheUrl,
      userID: authData?.user.id ?? "anon",
      schema,
      mutators: createMutators(authData),
      auth: cookie,
      logLevel: "debug",
    } as const satisfies ZeroOptions<Schema, Mutators>;
  }, [authData, cookie]);

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
          <Stack.Screen
            name="stress-test"
            options={{ title: "Stress Test", headerBackTitle: "Back" }}
          />
        </Stack>
      </SafeAreaProvider>
    </ZeroProvider>
  );
}

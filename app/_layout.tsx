import { authClient, useSession } from "@/lib/auth";
import {
  createMutators,
  type Mutators,
  schema,
  type Schema,
} from "@hello-zero-expo/shared";
import { authDataSchema } from "@hello-zero-expo/shared/auth";
import type { ZeroOptions } from "@rocicorp/zero";
import { expoSQLiteStoreProvider } from "@rocicorp/zero/expo";
import { ZeroProvider } from "@rocicorp/zero/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const { data: session } = useSession();

  const authData = useMemo(() => {
    const result = authDataSchema.safeParse(session);
    return result.success ? result.data : null;
  }, [session]);

  const zeroProps = useMemo(() => {
    return {
      storageKey: "hello-zero-expo",
      kvStore: expoSQLiteStoreProvider(),
      // 4848 is the default port for the zero server
      // but localhost is not supported in android
      // you need to change it to your API server's IP address
      server: "http://localhost:4848",
      userID: authData?.user.id ?? "anon",
      schema,
      mutators: createMutators(authData),
      auth: authClient.getCookie(),
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

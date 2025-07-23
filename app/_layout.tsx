import { schema } from "@/schema";
import { ZeroProvider } from "@rocicorp/zero/react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ZeroProvider kvStore={"mem"} server="http://localhost:4848" userID="anon" schema={schema}>
      <Stack />
    </ZeroProvider>
  );
}

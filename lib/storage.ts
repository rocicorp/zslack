// import { opSQLiteStoreProvider } from "@rocicorp/zero/op-sqlite";
import { expoSQLiteStoreProvider } from "@rocicorp/zero/expo-sqlite";
import { Platform } from "react-native";

export const storageProvider = () => {
  if (Platform.OS === "web") {
    return "idb" as const;
  }
  return expoSQLiteStoreProvider();
}

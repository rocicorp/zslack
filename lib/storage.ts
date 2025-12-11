// import { opSQLiteStoreProvider } from "@rocicorp/zero/op-sqlite";
import { expoSQLiteStoreProvider } from "@rocicorp/zero/expo-sqlite";
import { Platform } from "react-native";

const provider = Platform.OS === "web" ? "idb" : "expo-sqlite";

export const storageProvider = () => {
  if (provider === "idb") {
    return "idb" as const;
  }
  return expoSQLiteStoreProvider();
};

export const storageProviderName = () => {
  return provider;
};

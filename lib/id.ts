import * as Crypto from "expo-crypto";

export function generateId() {
  return Crypto.randomUUID();
}

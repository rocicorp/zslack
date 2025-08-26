import type { AuthData } from "./auth";

export function isLoggedIn(
  authData: AuthData | null,
): asserts authData is AuthData {
  if (!authData?.user.id) {
    throw new Error("User is not logged in");
  }
}

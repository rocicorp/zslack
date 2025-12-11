import type { AuthData } from "./auth";

export function isLoggedIn(
  authData: AuthData | undefined | null,
): asserts authData is AuthData {
  if (!authData?.user.id) {
    throw new Error("User is not logged in");
  }
}

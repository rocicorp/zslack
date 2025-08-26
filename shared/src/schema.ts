import {
  definePermissions,
  type PermissionsConfig,
  type Schema,
} from "@rocicorp/zero";
import type { AuthData } from "./auth";
import { schema } from "./zero-schema.gen";

export * from "./zero-schema.gen";

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  return {} satisfies PermissionsConfig<AuthData, Schema>;
});

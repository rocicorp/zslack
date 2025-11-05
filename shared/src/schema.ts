import { type Schema as ZeroSchema, definePermissions } from "@rocicorp/zero";
import { schema as genSchema } from "./zero-schema.gen";

export const schema = genSchema satisfies ZeroSchema;

export const permissions = definePermissions(schema, () => ({}));

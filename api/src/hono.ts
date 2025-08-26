import type { AuthData } from "@hello-zero-expo/shared/auth";
import { Hono } from "hono";

export const getHono = () =>
  new Hono<{ Variables: { auth: AuthData | null } }>();

import type { AuthData } from "@zslack/shared/auth";
import { Hono } from "hono";

export const getHono = () =>
  new Hono<{ Variables: { auth: AuthData | null } }>();

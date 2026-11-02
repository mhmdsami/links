import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import type { Env } from "../env";
import * as schema from "../schema/auth";
import type { Db } from "../utils/db";

/**
 * better-auth runs inside the API Worker. The database and secrets come from
 * the Worker bindings, so the instance is created per request.
 */
export function createAuth(env: Env, db: Db) {
  const google =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          scope: ["openid", "email", "profile"],
        }
      : null;

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    socialProviders: google ? { google } : undefined,
    trustedOrigins: (env.TRUSTED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    plugins: [
      // Deep-link handoff for the Expo app (links://) and bearer-token
      // sessions for native clients.
      expo(),
      bearer(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
